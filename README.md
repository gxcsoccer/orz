rom
===

A simple redis data layer framework

##Format

###identifier -- set

key: {namespace}:{schema}:{identifier}
member: id

###index -- key-value 
key: {namespace}:{schema}:{hash of the property value} 
value: id

###unqiue -- hash
key: {namespace}:{schema}:{property name}
field: {property value}
value: id

###record -- hash
key: {namespace}_{schema}_{id}
field: {field}
value: {value}