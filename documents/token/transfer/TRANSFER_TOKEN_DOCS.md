## Creating New Tokens

This documents how the API allows you to transfer a token (either `Tokenlandia` or `VideoLatino`) to a new address from the escrow contract

### Validation

Before a job is accepted several things are validated.

If any of these things fail a HTTP `400` will be returned with the reason for the failure.

* The post body should be valid
* No existing transfer job should exist for that token
* Token should be held in escrow
* Recipient should be a valid Ethereum address

![Job Accepted Flow](TransferToken.png)

#### Submit Job

Submit a new token creation job e.g.

* `HTTP` `POST` `https://api-56b6el2v7a-uc.a.run.app/v1/network/4/job/submit/transfer?key={uuid-key}`

Sample request body

```json
{
    'token_id': ${token_id},
    'token_type': ${token_type}
    'recipient': '0x9474CE90A96Ca3907428F22F202F72C55559df4a'
}
```

Where `token_type` can either be `TOKENLANDIA` or `VIDEO_LATINO`

--------------------

Sample successful job created `JSON` response

```json
{
}
```

* `jobId` is the ID of the newly created job and can be used to now query the stats of it

--------------------

* Failure - Invalid Token Data - `HTTP` status `400`
```json
{
    "error": "Invalid job data",
    "details": [
	    ...a list of errors found
    ]
}
```

* Failure - Token not help in escrow - `HTTP` status `400`
```json
{
    "error": "`Rejecting incoming job - tokenId [${token_id}] is not escrowed for chainId [${chainId}]`"
}
```

* Failure - Invalid recipient provided - `HTTP` status `400`
```json
{
    "error": "Rejecting incoming job - recipient [${recipient}] is not a valid web3 address"
}
```

* Failure - Duplicate Job - `HTTP` status `400`
```json
{
    "error": "Duplicate Job found",
    "existingJob": {
	    ...the exsiting job
    }
}
```