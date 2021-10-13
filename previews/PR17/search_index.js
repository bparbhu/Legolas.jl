var documenterSearchIndex = {"docs":
[{"location":"schema/#Tips-for-Schema-Authors-1","page":"Tips For Schema Authors","title":"Tips for Schema Authors","text":"","category":"section"},{"location":"schema/#","page":"Tips For Schema Authors","title":"Tips For Schema Authors","text":"If you're a newcomer to Legolas.jl, please familiarize yourself with via the tour before diving into this documentation.","category":"page"},{"location":"schema/#Simple-Integer-Versioning:-You-Break-It,-You-Bump-It-1","page":"Tips For Schema Authors","title":"Simple Integer Versioning: You Break It, You Bump It","text":"","category":"section"},{"location":"schema/#","page":"Tips For Schema Authors","title":"Tips For Schema Authors","text":"While it is fairly established practice to semantically version source code, the world of data/artifact versioning is a bit more varied. As presented in the tour, each Legolas.Schema has a single version integer. In this section, we'll discuss how to interpret this version integer.","category":"page"},{"location":"schema/#","page":"Tips For Schema Authors","title":"Tips For Schema Authors","text":"We start with an assumption: source code that defines any given Legolas schema and/or consumes/produces Legolas tables is already semantically versioned, such that consumer/producer packages can determine their compatibility with each other in the usual manner via interpreting major/minor/patch increments.","category":"page"},{"location":"schema/#","page":"Tips For Schema Authors","title":"Tips For Schema Authors","text":"With that in mind, here is the central guideline to obey as a Legolas schema author:","category":"page"},{"location":"schema/#","page":"Tips For Schema Authors","title":"Tips For Schema Authors","text":"If an update is made to a schema that potentially requires existing data to be rewritten in order to comply with the updated schema, then the version integer associated with that schema should be incremented.","category":"page"},{"location":"schema/#","page":"Tips For Schema Authors","title":"Tips For Schema Authors","text":"For example, you must increment the version integer if any of the following changes are made:","category":"page"},{"location":"schema/#","page":"Tips For Schema Authors","title":"Tips For Schema Authors","text":"A new non->:Missing required field is added to the schema.\nAn existing required field's type restriction is tightened.\nAn existing required field is renamed.","category":"page"},{"location":"schema/#How-to-Avoid-Breaking-Changes-1","page":"Tips For Schema Authors","title":"How to Avoid Breaking Changes","text":"","category":"section"},{"location":"schema/#","page":"Tips For Schema Authors","title":"Tips For Schema Authors","text":"It is preferable to avoid incrementing a schema's version integer (\"making a breaking change\") whenever possible to avoid code/data churn for consumers. Following the below guidelines should help make breaking changes less likely:","category":"page"},{"location":"schema/#","page":"Tips For Schema Authors","title":"Tips For Schema Authors","text":"Allow required fields to be Missing whenever reasonable.\nPrefer conservative field type restrictions from the get-go, to avoid needing to tighten them later.\nHandle/enforce \"potential deprecation paths\" in a required field's RHS definition when possible. For example, imagine a schema that contains a required field id::Union{UUID,String} = id where id is either a UUID, or a String that may be parsed as a UUID. Now, let's imagine we decided we wanted to update the schema such that new tables ALWAYS normalize id to a proper UUID. In this case, it is preferable to simply update this required field to id::Union{UUID,String} = UUID(id) instead of id::UUID = id. The latter is a breaking change that requires incrementing the schema's version integer, while the former achieves the same practical result without breaking consumers of old data.","category":"page"},{"location":"schema/#","page":"Tips For Schema Authors","title":"Tips For Schema Authors","text":"When making deprecation/API decisions, keep in mind that multiple schema versions may be defined in the same codebase; there's nothing that prevents @row(\"my-schema@1\", ...) and @row(\"my-schema@2\", ...) from being defined/utilized simultaneously.","category":"page"},{"location":"schema/#Naming-Conventions-1","page":"Tips For Schema Authors","title":"Naming Conventions","text":"","category":"section"},{"location":"schema/#","page":"Tips For Schema Authors","title":"Tips For Schema Authors","text":"Include a namespace. For example, assuming the schema is defined in a package Foo.jl, foo.automobile is good, automobile is bad.\nPrefer singular over plural. For example, foo.automobile is good, foo.automobiles is bad.\nDon't overqualify the schema name; that's what the qualified schema identifier is for! For example, bar.automobile@1>foo.automobile@1 is good, baz.supercar@1>bar.automobile@1 is good, bar.foo.automobile@1>foo.automobile@1 is bad, baz.automobile.supercar@1>bar.automobile@1 is bad.\nWhen writing tables to files, use *.<unqualified schema name>.arrow as the file extension. For example, filename.baz.supercar.arrow is good, filename.baz.supercar.bar.automobile.arrow is bad, baz.supercar.arrow is bad.","category":"page"},{"location":"schema/#Other-Tips-For-Composable-Schemas-1","page":"Tips For Schema Authors","title":"Other Tips For Composable Schemas","text":"","category":"section"},{"location":"schema/#","page":"Tips For Schema Authors","title":"Tips For Schema Authors","text":"Prefer idempotency in required field's RHS definitions.\nPrefer authoring child schemas such that they are Liskov substitutable for their parents. A less fancy way of stating the same thing: try to ensure that your child schema only adds additional fields to the parent and doesn't alter existing fields.","category":"page"},{"location":"specification/#Legolas-Table-Specification-1","page":"Legolas Table Specification","title":"Legolas Table Specification","text":"","category":"section"},{"location":"specification/#","page":"Legolas Table Specification","title":"Legolas Table Specification","text":"Legolas.jl's target (de)serialization format, Arrow, already features wide cross-language adoption, enabling serialized \"Legolas tables\" to be seamlessly read into many non-Julia environments. This brief specification defines the requirements for any given serialized Arrow table to be considered a \"valid Legolas table\" agnostic to any particular implementation.","category":"page"},{"location":"specification/#","page":"Legolas Table Specification","title":"Legolas Table Specification","text":"Currently, there is only a single requirement: the presence of a legolas_schema_qualified field in the Arrow table's metadata.","category":"page"},{"location":"specification/#","page":"Legolas Table Specification","title":"Legolas Table Specification","text":"The legolas_schema_qualified field's value should be either:","category":"page"},{"location":"specification/#","page":"Legolas Table Specification","title":"Legolas Table Specification","text":"name@version where:\nname is a lowercase alphanumeric string and may include the special characters . and -\nversion is a non-negative integer\nx>y where x and y are valid legolas_schema_qualified strings","category":"page"},{"location":"specification/#","page":"Legolas Table Specification","title":"Legolas Table Specification","text":"This field may be employed by consumers to match deserialized Legolas tables to application-layer schema definitions.","category":"page"},{"location":"#API-Documentation-1","page":"API Documentation","title":"API Documentation","text":"","category":"section"},{"location":"#","page":"API Documentation","title":"API Documentation","text":"If you're a newcomer to Legolas.jl, please familiarize yourself with via the tour before diving into this documentation.","category":"page"},{"location":"#","page":"API Documentation","title":"API Documentation","text":"CurrentModule = Legolas","category":"page"},{"location":"#Legolas-Schemas-and-Rows-1","page":"API Documentation","title":"Legolas Schemas and Rows","text":"","category":"section"},{"location":"#","page":"API Documentation","title":"API Documentation","text":"Legolas.@row\nLegolas.Row\nLegolas.Schema\nLegolas.is_valid_schema_name\nLegolas.schema_name\nLegolas.schema_version\nLegolas.schema_qualified_string\nLegolas.schema_parent","category":"page"},{"location":"#Legolas.@row","page":"API Documentation","title":"Legolas.@row","text":"@row(\"name@version\", field_expressions...)\n@row(\"name@version\" > \"parent_name@parent_version\", field_expressions...)\n\nDefine a new Legolas.Schema{name,version} whose required fields are specified by field_expressions. Returns Legolas.Row{Legolas.Schema{name,version}} which can be conveniently aliased to the caller's preferred binding for a row constructor associated with Legolas.Schema{name,version}.\n\nEach element of field_expression defines a required field for Legolas.Schema{name,version}, and is an expression of the form field::F = rhs where:\n\nfield is the corresponding field's name\n::F denotes the field's type constraint (if elided, defaults to ::Any).\nrhs is the expression which produces field::F (if elided, defaults to field).\n\nAs implied above, the following alternative forms are also allowed:\n\nfield::F (interpreted as field::F = field)\nfield = rhs (interpreted as field::Any = rhs)\nfield (interpreted as field::Any = field)\n\nFor more details and examples, please see Legolas.jl/examples/tour.jl and the \"Tips for Schema Authors\" section of the Legolas.jl documentation.\n\n\n\n\n\n","category":"macro"},{"location":"#Legolas.Row","page":"API Documentation","title":"Legolas.Row","text":"Legolas.Row(schema::Schema; fields...)\nLegolas.Row(schema::Schema, row)\n\nReturn a Legolas.Row <: Tables.AbstractRow instance whose fields are the provided fields (or the fields of row) validated/transformed in accordance with provided schema.\n\nFor more details and examples, please see Legolas.jl/examples/tour.jl.\n\n\n\n\n\n","category":"type"},{"location":"#Legolas.Schema","page":"API Documentation","title":"Legolas.Schema","text":"Legolas.Schema{name,version}\n\nA type representing the schema of a Legolas.Row. The name (a Symbol) and version (an Integer) are surfaced as type parameters, allowing them to be utilized for dispatch.\n\nFor more details and examples, please see Legolas.jl/examples/tour.jl and the \"Tips for Schema Authors\" section of the Legolas.jl documentation.\n\nSee also: schema_name, schema_version, schema_parent\n\n\n\n\n\n","category":"type"},{"location":"#Legolas.is_valid_schema_name","page":"API Documentation","title":"Legolas.is_valid_schema_name","text":"Legolas.is_valid_schema_name(x::AbstractString)\n\nReturn true if x is a valid schema name, return false otherwise.\n\nValid schema names are lowercase, alphanumeric, and may contain hyphens or periods.\n\n\n\n\n\n","category":"function"},{"location":"#Legolas.schema_name","page":"API Documentation","title":"Legolas.schema_name","text":"schema_name(::Type{<:Legolas.Schema{name}})\nschema_name(::Legolas.Schema{name})\n\nReturn name.\n\n\n\n\n\n","category":"function"},{"location":"#Legolas.schema_version","page":"API Documentation","title":"Legolas.schema_version","text":"schema_version(::Type{Legolas.Schema{name,version}})\nschema_version(::Legolas.Schema{name,version})\n\nReturn version.\n\n\n\n\n\n","category":"function"},{"location":"#Legolas.schema_qualified_string","page":"API Documentation","title":"Legolas.schema_qualified_string","text":"schema_qualified_string(::Type{Legolas.Schema{name,version}})\n\nReturn this Legolas.Schema's fully qualified schema identifier string. This string is serialized as the \"legolas_schema_qualified\"field value in table metadata for table written via [Legolas.write`](@ref).\n\n\n\n\n\n","category":"function"},{"location":"#Legolas.schema_parent","page":"API Documentation","title":"Legolas.schema_parent","text":"schema_parent(::Type{Legolas.Schema{name,version}})\nschema_parent(::Legolas.Schema{name,version})\n\nReturn the Legolas.Schema instance that corresponds to the parent of the given Legolas.Schema.\n\n\n\n\n\n","category":"function"},{"location":"#Validating/Writing/Reading-Legolas-Tables-1","page":"API Documentation","title":"Validating/Writing/Reading Legolas Tables","text":"","category":"section"},{"location":"#","page":"API Documentation","title":"API Documentation","text":"Legolas.validate\nLegolas.write\nLegolas.read","category":"page"},{"location":"#Legolas.validate","page":"API Documentation","title":"Legolas.validate","text":"Legolas.validate(tables_schema::Tables.Schema, legolas_schema::Legolas.Schema)\n\nThrows an ArgumentError if tables_schema does comply with legolas_schema, otherwise returns nothing.\n\nSpecifically, tables_schema is considered to comply with legolas_schema if:\n\nevery non->:Missing field required by legolas_schema is present in tables_schema.\nT <: S for each field f::T in tables_schema that matches a required legolas_schema field f::S.\n\n\n\n\n\n","category":"function"},{"location":"#Legolas.write","page":"API Documentation","title":"Legolas.write","text":"Legolas.write(io_or_path, table, schema::Schema; validate::Bool=true, kwargs...)\n\nWrite table to io_or_path, inserting the appropriate legolas_schema_qualified field in the written out Arrow metadata.\n\nIf validate is true, Legolas.validate will be called on the table before it written out.\n\nAny other provided kwargs are forwarded to an internal invocation of Arrow.write.\n\nNote that io_or_path may be any type that supports Base.write(io_or_path, bytes::Vector{UInt8}).\n\n\n\n\n\n","category":"function"},{"location":"#Legolas.read","page":"API Documentation","title":"Legolas.read","text":"Legolas.read(io_or_path; validate::Bool=true)\n\nRead and return an Arrow.Table from io_or_path.\n\nIf validate is true, Legolas.validate will be called on the table before it is returned.\n\nNote that io_or_path may be any type that supports Base.read(io_or_path)::Vector{UInt8}.\n\n\n\n\n\n","category":"function"},{"location":"#Utilities-1","page":"API Documentation","title":"Utilities","text":"","category":"section"},{"location":"#","page":"API Documentation","title":"API Documentation","text":"Legolas.lift\nLegolas.assign_to_table_metadata!\nLegolas.gather\nLegolas.locations\nLegolas.materialize","category":"page"},{"location":"#Legolas.lift","page":"API Documentation","title":"Legolas.lift","text":"lift(f, x)\n\nReturn f(x) unless x isa Union{Nothing,Missing}, in which case return missing.\n\nThis is particularly useful when handling values from Arrow.Table, whose null values may present as either missing or nothing depending on how the table itself was originally constructed.\n\n\n\n\n\nlift(f)\n\nReturns a curried function, x -> lift(f,x)\n\n\n\n\n\n","category":"function"},{"location":"#Legolas.assign_to_table_metadata!","page":"API Documentation","title":"Legolas.assign_to_table_metadata!","text":"assign_to_table_metadata!(table, pairs)\n\nAssign the given pairs (an iterable of Pair{String,String}) to table's associated Arrow metadata Dict, creating this metadata Dict if it doesn't already exist.\n\nReturns table's associated Arrow metadata Dict.\n\nPlease note https://github.com/JuliaData/Arrow.jl/issues/211 before using this function.\n\nNote that we intend to eventually migrate this function from Legolas.jl to a more appropriate package.\n\n\n\n\n\n","category":"function"},{"location":"#Legolas.gather","page":"API Documentation","title":"Legolas.gather","text":"gather(column_name, tables...; extract=((table, idxs) -> view(table, idxs, :)))\n\nGather rows from tables into a unified cross-table index along column_name. Returns a Dict whose keys are the unique values of column_name across tables, and whose values are tuples of the form:\n\n(rows_matching_key_in_table_1, rows_matching_key_in_table_2, ...)\n\nThe provided extract function is used to extract rows from each table; it takes as input a table and a Vector{Int} of row indices, and returns the corresponding subtable. The default definition is sufficient for DataFrames tables.\n\nNote that this function may internally call Tables.columns on each input table, so it may be slower and/or require more memory if any(!Tables.columnaccess, tables).\n\nNote that we intend to eventually migrate this function from Legolas.jl to a more appropriate package.\n\n\n\n\n\n","category":"function"},{"location":"#Legolas.locations","page":"API Documentation","title":"Legolas.locations","text":"locations(collections::Tuple)\n\nReturn a Dict whose keys are the set of all elements across all provided collections, and whose values are the indices that locate each corresponding element across all provided collecitons.\n\nSpecifically, locations(collections)[k][i] will return a Vector{Int} whose elements are the index locations of k in collections[i]. If !(k in collections[i]), this Vector{Int} will be empty.\n\nFor example:\n\njulia> Legolas.locations((['a', 'b', 'c', 'f', 'b'],\n                          ['d', 'c', 'e', 'b'],\n                          ['f', 'a', 'f']))\nDict{Char, Tuple{Vector{Int64}, Vector{Int64}, Vector{Int64}}} with 6 entries:\n  'f' => ([4], [], [1, 3])\n  'a' => ([1], [], [2])\n  'c' => ([3], [2], [])\n  'd' => ([], [1], [])\n  'e' => ([], [3], [])\n  'b' => ([2, 5], [4], [])\n\nThis function is useful as a building block for higher-level tabular operations that require indexing/grouping along specific sets of elements.\n\n\n\n\n\n","category":"function"},{"location":"#Legolas.materialize","page":"API Documentation","title":"Legolas.materialize","text":"materialize(table)\n\nReturn a fully deserialized copy of table.\n\nThis function is useful when table has built-in deserialize-on-access or conversion-on-access behavior (like Arrow.Table) and you'd like to pay such access costs upfront before repeatedly accessing the table.\n\nNote that we intend to eventually migrate this function from Legolas.jl to a more appropriate package.\n\n\n\n\n\n","category":"function"},{"location":"faq/#FAQ-1","page":"FAQ","title":"FAQ","text":"","category":"section"},{"location":"faq/#What-is-the-point-of-Legolas.jl?-Who-benefits-from-using-it?-1","page":"FAQ","title":"What is the point of Legolas.jl? Who benefits from using it?","text":"","category":"section"},{"location":"faq/#","page":"FAQ","title":"FAQ","text":"At its core, Legolas.jl provides a lightweight, expressive set of mechanisms/patterns for generating Tables.AbstractRow types in a manner that enables schema composability, extensibility and a few nice utilties on top.","category":"page"},{"location":"faq/#","page":"FAQ","title":"FAQ","text":"The package originated from code developed internally at Beacon to wrangling heterogeneous Arrow datasets, and is thus probably mostly useful for folks in a similar situation. If you're curating tabular datasets and you'd like to build shared Julia tools atop the schemas therein, then Legolas.jl may be worth checking out.","category":"page"},{"location":"faq/#Why-does-Legolas.jl-support-Arrow-as-a-(de)serialization-target,-but-not,-say,-JSON?-1","page":"FAQ","title":"Why does Legolas.jl support Arrow as a (de)serialization target, but not, say, JSON?","text":"","category":"section"},{"location":"faq/#","page":"FAQ","title":"FAQ","text":"Technically, Legolas.jl's core Row/Schema functionality is totally agnostic to (de)serialization and could be useful for anybody who wants to generate new Tables.AbstractRow types.","category":"page"},{"location":"faq/#","page":"FAQ","title":"FAQ","text":"Otherwise, with regards to (de)serialization-specific functionality, Beacon has put effort into ensuring Legolas.jl works well with Arrow.jl \"by default\" simply because we're heavy users of the Arrow format. There's nothing stopping users from composing the package with JSON3.jl or other packages.","category":"page"}]
}