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
|addressL1c | String    |
|districtc  | String    |
|cityc      | String    |
|statec     | String    |
|pincodec   | Number    |
|Permanant Address      |
|addressL1p | String    |
|districtp  | String    |
|cityp      | String    |
|statep     | String    |
|pincodep   | Number    |
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
