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
|dob		| Date (YYYY-MM-DD)|
|gender		| ['Male', 'Female', 'Others']|

### /user/application/:applicationNo (Accepts form-data)
|Fields     |Data Type  |
|-----------|-----------|
|-----------|-----------|
|aPhone 	| Number	|
|bloodGroup	| ['O+','O-','A+','A-','B+','B-','AB+','AB-']|
|Contact Address        |
|addressL1C | String    |
|districtC  | String    |
|cityC      | String    |
|stateC     | String    |
|pincodeC   | Number    |
|Permanant Address      |
|addressL1P | String    |
|districtP  | String    |
|cityP      | String    |
|stateP     | String    |
|pincodeP   | Number    |
|Father Details         |
|fatherName | String    |
|fatherOccupation| String    |
|fatherMobile| Number    |
|fatherEmail| String    |
|Mother Details         |
|motherName | String    |
|motherOccupation| String    |
|motherMobile| Number    |
|motherEmail| String    |
|Guardian Details       |
|guardianName| String    |
|guardianRelation| String    |
|guardianMobile| Number    |
|guardianEmail| String    |
|annualIncome| Number   |
|NRI-Sponser Details    |
|NRIname    | String    |
|NRIrelation   | String    |
|bp1        | ['CSE', 'ECE','EEE','CE','ME']|
|bp2        | ['CSE', 'ECE','EEE','CE','ME']|
|bp3        | ['CSE', 'ECE','EEE','CE','ME']|
|bp4        | ['CSE', 'ECE','EEE','CE','ME']|
|bp5        | ['CSE', 'ECE','EEE','CE','ME']|
|busFacility| Boolean   |
|hostelFacility|Boolean |
|Academic Details       |
|qualifyingExam| String |
|phyMarkObtained| Number|
|phyMaxMarks| Number    |
|chemMarkObtained| Number|
|chemMaxMarks| Number   |
|mathsMarkObtained| Number|
|mathsMaxMarks| Number  |
|filePhotograph| File   |
|imgSign    | File      |
|fileTransactionID| File|
|transactionID| String  |
## GET APIs
### /admin/count (Accepts form-data)
#### Request Body
|Fields  | Data Type |
|--------|-----------|
|token   | string    |
|...	 | ...		 |
'token' has to be for an admin account.
/count takes an arbitary number of parameters of arbitrary type and uses it to query
the database. The number of matches is returned in a count field.
#### Response Body
|Fields  | Data Type |
|--------|-----------|
|status  | String    |
|count   | Number    |
##### Example requests
```
{
  token: <token>,
  quota: 'Management'
}

{
  token: <token>,
  dob: '1998-08-08',
  quota: 'NRI'			// count of all NRIs with given dob
}
```
