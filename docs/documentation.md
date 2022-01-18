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
|lastName	| String	|
|email		| String	|
|age		| Number	|
|aadhar		| Number	|
|phone		| Number	|
|dob		| Date (YYMMDD)|
|gender		| ['Male', 'Female', 'Others']|

### /user/application/:applicationNo (Accepts form-data)
|Fields     |Data Type  |
|-----------|-----------|
|-----------|-----------|
|aPhone 	| Number	|
|bloodGroup	| ['O+','O-','A+','A-','B+','B-','AB+','AB-']|
|contactAddress         |
|addressL1  | String    |
|district   | String    |
|city       | String    |
|state      | String    |
|pincode    | Number    |


