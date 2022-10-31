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
