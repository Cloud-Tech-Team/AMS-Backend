# API Documentation
### All APIs expect the JWT token in req.headers.authorization (Bearer Token)
## POST APIs
### /admin/login (Accepts form-data)
#### Request Body
|Fields        |Data Type     |
|--------------|--------------|
|email         | String       |
|password      | String       |
#### Response Body
|Fields        |Data Type     |
|--------------|--------------|
|status        |['SUCCESS', 'FAILURE']|
|message       | String       |
|token         | JWT token    |
|role [TODO remove]| 'admin'  |


### /admin/add_coadmin
#### Request Body
|Fields        |Data Type     |
|--------------|--------------|
|firstName     | String       |
|middleName (Optional)    | String       |
|lastName      | String       |
|email         | String       |
|password      | String       |
#### Response Body
|Fields        |Data Type     |
|--------------|--------------|
|status        |['SUCCESS', 'FAILURE']|
|message       | String       |
#### Description
* Create co-admin in AdminDB
* Should have unique email

### /admin/search
#### Request Body
|Fields           |Data Type     |
|-----------------|--------------|
|count (optional) | Number       |
|offset (optional)| Number       |
| ...             | ...          |
### Response Body
|Fields           |Data Type     |
|-----------------|--------------|
|status           | ['SUCCESS', 'FAILURE']|
|message          | String       |
|count            | Number       |
|list             | Array of objects|
#### Description
* Request
	* count - the number of results to return from the query  
	  Empty value means return all results
	* offset - the offset from which to return the results, starting from 0.  
	  Defaults to 0.
	* The rest of the fields in the request body are used to perform the query
* Response
	* count - size of list (see below)
	* list - the results from the database

### /admin/count (Accepts form-data)
#### Request Body
|Fields           |Data Type        |
|-----------------|-----------------|
| queries         | Array of Objects|
### Response Body
|Fields           |Data Type        |
|-----------------|-----------------|
|status           | ['SUCCESS', 'FAILURE']|
|result           | Array (of counts) |
#### Description
* Request
	* queries - an array of query objects. Each will be used to query the database, and  
	  the count is determined.  
	  Eg: { queries: [{'quota': 'Management'}, {'firstName': 'John'}] }
* Response
	* The count of each query is returned in the result field as an array.
