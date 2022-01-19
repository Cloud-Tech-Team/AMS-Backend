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
|Contact Address        |
|addressL1  | String    |
|district   | String    |
|city       | String    |
|state      | String    |
|pincode    | Number    |
|Permanant Address      |
|addressL1  | String    |
|district   | String    |
|city       | String    |
|state      | String    |
|pincode    | Number    |
|Father Details         |
|name       | String    |
|occupation | String    |
|mobile     | Number    |
|email      | String    |
|Mother Details         |
|name       | String    |
|occupation | String    |
|mobile     | Number    |
|email      | String    |
|Guardian Details       |
|name       | String    |
|relation   | String    |
|mobile     | Number    |
|email      | String    |
|annualIncome| Number   |
|NRI-Sponser Details    |
|name       | String    |
|relation   | String    |
|bp1        | ['CSE', 'ECE','EEE','CE','ME']|
|bp2        | ['CSE', 'ECE','EEE','CE','ME']|
|bp3        | ['CSE', 'ECE','EEE','CE','ME']|
|bp4        | ['CSE', 'ECE','EEE','CE','ME']|
|bp5        | ['CSE', 'ECE','EEE','CE','ME']|
|busFacility| Boolean   |
|hostelFacility|Boolean |
|Academic Details       |
|filePhotograph| File   |
|imgSign    | File      |
|fileTransactionID| File|
|transactionID| String  |