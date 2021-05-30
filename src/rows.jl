#####
##### Schema
#####

const ALLOWED_SCHEMA_NAME_CHARACTERS = Char['-', '.', 'a':'z'..., '0':'9'...]

is_valid_schema_name(x::AbstractString) = all(i -> i in ALLOWED_SCHEMA_NAME_CHARACTERS, x)

struct Schema{name,version} end

function Schema(name::AbstractString, version::Integer)
    is_valid_schema_name(name) || throw(ArgumentError("TODO"))
    return Schema{Symbol(name),version}()
end

function Schema(str::AbstractString)
    x = split(first(split(str, ">", limit=2)), "::")
    if length(x) == 2
        name, version = x
        version = tryparse(Int, version)
        version isa Int && return Schema(name, version)
    end
    throw(ArgumentError("TODO"))
end

@inline schema_version(::Type{<:Schema{name,version}}) where {name,version} = version
@inline schema_version(schema::Schema) = schema_version(typeof(schema))

@inline schema_name(::Type{<:Schema{name}}) where {name} = name
@inline schema_name(schema::Schema) = schema_name(typeof(schema))

@inline schema_parent(::Type{<:Schema}) = nothing
@inline schema_parent(schema::Schema) = schema_parent(typeof(schema))

function qualified_schema_string end

function parse_row_schema_expr(x)
    if x isa Expr
        if x.head == :call && x.args[1] == :> && length(x.args) == 3
            schema, _ = parse_row_schema_expr(x.args[2])
            parent, _ = parse_row_schema_expr(x.args[3])
            return schema, parent
        elseif x.head == :(::) && x.args[1] isa String && x.args[2] isa Integer
            return Schema(x.args[1], x.args[2]), nothing
        end
    end
    return nothing, nothing
end

function transform end

function _transform end

function validate end

function _validate end

function validate_expected_field(schema::Tables.Schema, name::Symbol, ::Type{T}) where {T}
    i = findfirst(==(name), schema.names)
    if isnothing(i)
        Missing <: T || throw(ArgumentError("could not find expected field `$name::$T` in $schema"))
    else
        schema.types[i] <: T || throw(ArgumentError("field `$name` has unexpected type; expected <:$T, found $(schema.types[i])"))
    end
    return nothing
end

#####
##### Row
#####

struct Row{S<:Schema,F}
    schema::S
    fields::F
    function Row(schema::Schema; fields...)
        fields = transform(schema; fields...)
        return new{typeof(schema),typeof(fields)}(schema, fields)
    end
end

Row{S}(args...; kwargs...) where {S} = Row(S(), args...; kwargs...)

Row(schema::Schema, fields) = Row(schema, NamedTuple(Tables.Row(fields)))
Row(schema::Schema, fields::Row) = Row(schema, getfield(fields, :fields))
Row(schema::Schema, fields::NamedTuple) = Row(schema; fields...)

Base.propertynames(row::Row) = propertynames(getfield(row, :fields))
Base.getproperty(row::Row, name::Symbol) = getproperty(getfield(row, :fields), name)

Tables.getcolumn(row::Row, i::Int) = Tables.getcolumn(getfield(row, :fields), i)
Tables.getcolumn(row::Row, nm::Symbol) = Tables.getcolumn(getfield(row, :fields), nm)
Tables.columnnames(row::Row) = Tables.columnnames(getfield(row, :fields))

macro row(schema_expr, fields...)
    schema, parent = parse_row_schema_expr(schema_expr)
    isnothing(schema) && throw(ArgumentError("`@row` schema argument must be of the form `name::version` or `name::version > parent_name::parent_version`. Received: $schema_expr"))
    fields = map(fields) do f
        original_f = f
        f isa Symbol && (f = Expr(:(::), f, :Any))
        f.head == :(::) && (f = Expr(:(=), f, f.args[1]))
        f.head == :(=) && f.args[1] isa Symbol && (f.args[1] = Expr(:(::), f.args[1], :Any))
        f.head == :(=) && f.args[1].head == :(::) || throw(ArgumentError("malformed `@row` field expression: $original_f"))
        return f
    end
    validate_fields = map(fields) do f
        name, type = f.args[1].args
        return :(validate_expected_field(tables_schema, $(Base.Meta.quot(name)), $(esc(type))))
    end
    field_names = [esc(f.args[1].args[1]) for f in fields]
    schema_type = Base.Meta.quot(typeof(schema))
    quoted_parent = Base.Meta.quot(parent)
    qualified_schema_string = string(schema_name(schema), "::", schema_version(schema))
    parent_transform = nothing
    parent_validate = nothing
    if !isnothing(parent)
        qualified_schema_string = :(string($qualified_schema_string, '>', Legolas.qualified_schema_string($quoted_parent)))
        parent_transform = :(fields = transform($quoted_parent; fields...))
        parent_validate = :(validate(tables_schema, $quoted_parent))
    end
    return quote
        Legolas.qualified_schema_string(::$schema_type) = $qualified_schema_string

        Legolas.schema_parent(::Type{<:$schema_type}) = $quoted_parent

        function Legolas._transform(::$schema_type; $([Expr(:kw, f, :missing) for f in field_names]...), custom...)
            $(map(esc, fields)...)
            return (; $(field_names...), custom...)
        end

        function Legolas._validate(tables_schema::Tables.Schema, legolas_schema::$schema_type)
            $(validate_fields...)
            return nothing
        end

        # There exist very clean non-macro implementation of these function:
        #
        #    function transform(schema::Schema; fields...)
        #        parent = schema_parent(schema)
        #        parent isa Schema && (fields = transform(parent; fields...))
        #        return _transform(schema; fields...)
        #    end
        #
        #    function validate(tables_schema::Tables.Schema, legolas_schema::Schema)
        #        parent = schema_parent(legolas_schema)
        #        parent isa Schema && validate(parent, tables_schema)
        #        _validate(tables_schema, legolas_schema)
        #        return nothing
        #    end
        #
        # However, basic benchmarking demonstrates that the above versions can allocate
        # unnecessarily for schemas with a few ancestors, while the below "hardcoded"
        # versions do not.

        function Legolas.transform(schema::$schema_type; fields...)
            $parent_transform
            return _transform(schema; fields...)
        end

        function Legolas.validate(tables_schema::Tables.Schema, legolas_schema::$schema_type)
            $parent_validate
            return _validate(tables_schema, legolas_schema)
        end

        Legolas.Row{$schema_type}
    end
end
