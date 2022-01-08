# API Documentation
## POST APIs
### /user/register/ (Accepts form-data)
#### Request Body
|Fields		|Data Type	|
|-----------|-----------|
|quota 		| ['Management', 'Government', 'NRI']|
|course		| ['MTech', 'BTech']|
|firstName	| String	|
|middleName	| String	|
|email		| String	|
|age		| Number	|
|aadhar		| Number	|
|phone		| Number	|
|dob		| Date (YYMMDD)|
|gender		| ['Male', 'Female', 'Others']|
