## Creating New Tokens

#### Submit Job

Submit a new token creation job e.g.

* `HTTP` `POST` `https://api-56b6el2v7a-uc.a.run.app/v1/network/4/job/submit/createtoken/general?key={uuid-key}`

Sample request body

```
{
    'token_id': ${tokenId},
    'coo': 'USA',
    'artist_initials': 'RSA',
    'series': '002',
    'design': '0003',
    'name': `a name`,
    'description': `a description`,
    'image': 'http://preview.tokenlandia.com/wp-content/uploads/2019/11/b8e4d509cb644e254fbc16eb6a53fd48_listingImg_IOznWUjgk6.jpg',
    'artist': 'artist',
    'artist_assistant': 'assistant',
    'brand': 'brand',
    'model': 'model',
    'purchase_location': 'london',
    'purchase_date': '2020-02-01',
    'customization_location': 'tokyo',
    'customization_date': '2020-02-06',
    'material_1': 'a' // Can have up to 5 materials (all optional)
}
```

--------------------

Sample successful job created `JSON` response

```
{
    "jobId": "AoHZeOquKMZe9SFGnquD",
    "chainId": "4",
    "tokenId": "112",
    "status": "ACCEPTED",
    "jobType": "CREATE_TOKEN",
    "createdDate": 1582713451790,
    "context": {
        "ACCEPTED": {
           ...The accepted and formatted data
        }
    }
}
```

* `jobId` is the ID of the newly created job and can be used to now query the stats of it

--------------------

* Failure - Invalid Token Data - `HTTP` status `400`
```
{
    "error": "Invalid job data",
    "details": [
	    ...a list of errors found
    ]
}
```

* Failure - Token already created - `HTTP` status `400`
```
{
    "error": "Token already created"
}
```

* Failure - Duplicate Job - `HTTP` status `400`
```
{
    "error": "Duplicate Job found",
    "existingJob": {
	    ...the exsiting job
    }
}
```

##### Validation

Before a job is accepted several things are validated.

If any of these things fail a HTTP `400` will be returned with the reason for the failure.

* No existing job should exist for that token given token
* No existing token should already exist with that ID
* The post body should be valid
* If its not valid we will tell you what's wrong with the data

![Job Accepted Flow](documents/job_accepted_flow.png)

### Get Job Status

This API can be used to get the status about a specific job which has been previously accepted.

`HTTP` `GET` `https://api-56b6el2v7a-uc.a.run.app/v1/network/4/job/details/${JOB_ID}?key={uuid-key}`

```
{
    "jobId": "PXVA3FsAwzPlmvT10QJf",
    "createdDate": 1582292771324,
    "chainId": "4",
    "status": "TRANSACTION_SENT",
    "jobType": "CREATE_TOKEN",
    "tokenId": "616",
    "context": {
      	… the job data
    }
}
```

One a job has been accepted you can poll this endpoint to see its progress through the processing queue, each token 
can take a few minutes to process.


### Get Queue Summary

This API gives you details on how many jobs are at each stage of the processing queue.

`HTTP` `GET` `https://api-56b6el2v7a-uc.a.run.app/v1/network/4/job/summary?key={uuid-key}`

```
{
    "numOfJobsForJobType": 102,
    "numOfAcceptedJobs": 0,
    "numOfMetadataCreatedJobs": 14,
    "numOfTransactionSentJobs": 0,
    "numOfJobCompleteJobs": 88,
    "numOfTransactionFailedJobs": 0
}
```
