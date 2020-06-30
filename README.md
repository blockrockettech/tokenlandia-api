# TokenLandia API

[![Test Passing](https://github.com/blockrockettech/tokenlandia-api/workflows/Test%20Runner/badge.svg)](https://github.com/blockrockettech/tokenlandia-api/actions)

### Running locally
Install the dependencies: 

    npm i

Fire it up:

    npm run start

## Prerequisites

#### Switching networks

All API endpoints are network aware, this is so we can point the API to either `Rinkeby` for test or `mainnet` for production

* Whenever you see `/network/{chainId}` - `{chainId}` needs to be replaced with one of the following:
    - `1` - For the `main` ethereum network
    - `4` - For the `rinkeby` test ethereum network

#### Multi-asset support and switching between assets

Some API endpoints are asset aware and will allow you to perform specific operations on either `Tokenlandia` or `VideoLatino` tokens.
* Whenever you see `/{tokenType}/` or similar, `{tokenType}` needs to be replaced with one of the following:
  - `TOKENLANDIA` - For operations on `Tokenlandia` tokens
  - `VIDEO_LATINO` - For operations on `VideoLatino` tokens
    
#### Security

Those endpoints which submit jobs to a network require a specific query param `key` to be provided.

If one is not provided an error response will be returned e.g. `?key={uuid-key}`

## API functions

The API consists of several different endpoints to allow different operations to be performed. Some operations require Ether (ETH), Ethereum's native currency, in order to be executed on the blockchain. These operations are:
- Creating a token
- Updating a token
- Transferring a token

As a result, the API has its own Ethereum account.

## GET API ETH Balance

You can hit the following `GET` endpoint:

    /v1/network/{chainId}/account/balance

Replacing `{chainId}` as appropriate.

An example response is as follows:
```
{
    "balance": "0.68750194 ETH",
    "address": "0x1f5AB738A27C3c043072Aa7E06B8a8A433210a76",
    "currentGasPrice": "24 GWEI",
    "currentGasThreshold": "25 GWEI"
}
```

This gives you the balance of the API as well as the public address for the specified network. This should make knowing which account to top up really easy.

For your convenience, we have also included information about `mainnet` current GAS prices and the threshold above which, a transaction will not be executed.  
## GET token information

You can hit the following `GET` endpoint:

    /v1/network/{chainId}/asset/{tokenType}/info/{tokenIdOrProductId}
    
Replacing `{chainId}`, `{tokenType}` and `{tokenIdOrProductId}` as appropriate.

This will return information about a token ONLY once it has been minted to the blockchain.

For example - this `HTTP` `GET` request we could run is:

    https://api-56b6el2v7a-uc.a.run.app/v1/network/4/asset/VIDEO_LATINO/info/1
    
This is for chain ID `4` / `rinkeby` and token ID `1`. There are 3 tokens (token ID 1-3) minted on rinkeby.

The expected response would be:

```
{
	0: "GBR-MIA",
	1: "QmUSz4d2dRoiKK2Bs3vmdbVAU8pwSG8ryRu6bUNxGyUSvp",
	_productCode: "GBR-MIA",
	_metadataIpfsHash: "QmUSz4d2dRoiKK2Bs3vmdbVAU8pwSG8ryRu6bUNxGyUSvp",
	token_id: "1",
	token_uri: "https://ipfs.infura.io/ipfs/QmUSz4d2dRoiKK2Bs3vmdbVAU8pwSG8ryRu6bUNxGyUSvp",
	open_sea_link: "https://rinkeby.opensea.io/assets/0x84cCfbc2Ec9572307Def63535A9346ab08336fdB/1",
	etherscan_link: "https://rinkeby.etherscan.io/token/0x84cCfbc2Ec9572307Def63535A9346ab08336fdB?a=1",
	transaction_hash: "0xe413fd079f8ae4b100782422f8649e5b305e8ff9c356cc33070f4add8feb9e68",
	etherscan_transaction_hash: "https://rinkeby.etherscan.io/tx/0xe413fd079f8ae4b100782422f8649e5b305e8ff9c356cc33070f4add8feb9e68",
	contract_address: "0x84cCfbc2Ec9572307Def63535A9346ab08336fdB",
	name: "Shakira Shakira",
	description: "Hello from Shakira",
	image: "https://ipfs.infura.io/ipfs/QmdxsMpz6MRtCBD9kabu8DXsHch93sLnZE3DVGhfAt5isV",
	type: "VIDEO_LATINO",
	created: 1591794541,
	attributes: {
		coo: "GBR",
		initials: "MIA",
		token_id: "1",
		creation_location: "Colombia",
		creation_date: "2020-06-02",
		business_brand: "Brand",
		celebrity_name: "Shakira",
		video_language: "EN",
		video_link: "aws",
		video_category: "VideoSaludos",
		video_id: "GBR-MIA-1"
	}
}
```

## Creating New Tokens

Blockchains are asynchronous in nature and the current implementation of the job processing queue simply sends 
transactions from one account, one at a time. 

The functions are designed to validate and accept large batches of jobs however each job is then processed sequentially, one at a time.

This API is currently split into 3 main parts, below I will go over each endpoint:

* [Job Types](#job-types) - add a new jobs to the queue to be processed
* [Get Job Status](#get-job-status) - get the status of the job in the queue
* [Get Queue Summary](#get-queue-summary) - get the total number of outstanding jobs in the queue

When jobs are processed they go through a set of finite states which as seen below.

A breakdown of each state is as follows:

* `ACCEPTED`            - Job is valid and has been accepted
* `PRE_PROCESSING_COMPLETE`    - Any pre processing such as generating token metadata and storing on IPFS is done at this stage
* `PRE_PROCESSING_FAILED` - When a failure has taken place at the pre processing stage. It could be something like the push to the ipfs gateway failed etc.
* `TRANSACTION_SENT`    - Token transaction has been sent to the blockchain based on the job type
* `JOB_COMPLETE`        - The transaction has been successfully been mined on the blockchain
* `TRANSACTION_FAILED`  - Something has gone wrong executing the transaction and the job has failed

### Job Types

Three types of job exist, each one preforming a different blockchain actions.

* Creating new tokens - [docs](/documents/token/create/CREATE_TOKEN_DOCS.md)

* Updating token metadata (only applies to Tokenlandia tokens) - [docs](/documents/token/update/UPDATE_TOKEN_DOCS.md)

* Transferring token - [docs](/documents/token/transfer/TRANSFER_TOKEN_DOCS.md)

Using transactions executed on the `rinkeby` network, we have been able to determine that the above job types require the following amount of gas to execute:
- Minting = 252,488 GAS
- Updating token metadata = 37,823 GAS
- Token transfer = 81,312 GAS

### Get Job Status

This API can be used to get the status about a previously accepted job for a specific token type.

You can poll this endpoint to see a job's progress through the processing queue. Each token can take a few minutes to process.

#### For a Tokenlandia job

`HTTP` `GET` `https://api-56b6el2v7a-uc.a.run.app/v1/network/4/job/details/{JOB_ID}/general?key={uuid-key}`

```json
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

#### For a Video Latino job

`HTTP` `GET` `https://api-56b6el2v7a-uc.a.run.app/v1/network/4/job/details/{JOB_ID}/videolatino?key={uuid-key}`

Which would return the same response structure as the tokenlandia example above

### Get Queue Summary

This API gives you details on how many jobs are at each stage of the processing queue.

`HTTP` `GET` `https://api-56b6el2v7a-uc.a.run.app/v1/network/4/job/{tokenType}/summary?key={uuid-key}`

Replacing `{tokenType}` as appropriate

```json
{
    "CREATE_TOKEN": {
        "numOfJobsForJobType": 153,
        "numOfAcceptedJobs": 0,
        "numOfPreProcessingCompleteJobs": 0,
        "numOfTransactionSentJobs": 0,
        "numOfJobCompleteJobs": 153,
        "numOfTransactionFailedJobs": 0
    },
    "UPDATE_TOKEN": {
        "numOfJobsForJobType": 1,
        "numOfAcceptedJobs": 0,
        "numOfPreProcessingCompleteJobs": 0,
        "numOfTransactionSentJobs": 0,
        "numOfJobCompleteJobs": 1,
        "numOfTransactionFailedJobs": 0
    },
    "TRANSFER_TOKEN": {
        "numOfJobsForJobType": 1,
        "numOfAcceptedJobs": 0,
        "numOfPreProcessingCompleteJobs": 0,
        "numOfTransactionSentJobs": 0,
        "numOfJobCompleteJobs": 1,
        "numOfTransactionFailedJobs": 0
    }
}
```

Note that the summary for `VIDEO_LATINO` will not include stats on the `UPDATE_TOKEN` job type as this is not supported.

### Get In Flight Jobs

This API gives you details on jobs which are being processed by the job queue on a per token type basis

`HTTP` `GET` `https://api-56b6el2v7a-uc.a.run.app/v1/network/4/job/{tokenType}/open/summary?key={uuid-key}`

```json
{
    "CREATE_TOKEN": [
        {
            "chainId": "4",
            "context": {
                "ACCEPTED": {
                    "artist": "artist",
                    "artist_assistant": "assistant",
                    "artist_initials": "AFM",
                    "brand": "brand",
                    "coo": "COL",
                    "description": "token description",
                    "design": "0003",
                    "image": "http://preview.tokenlandia.com/wp-content/uploads/2019/11/b8e4d509cb644e254fbc16eb6a53fd48_listingImg_IOznWUjgk6.jpg",
                    "model": "model",
                    "name": "tokenlandia test api",
                    "product_code": "COL-AFM-002-0003",
                    "product_id": "COL-AFM-002-0003-202006122034",
                    "purchase_date": "2020-06-12",
                    "purchase_location": "london",
                    "series": "002",
                    "token_id": "202006122034",
                    "type": "GENERAL_ASSET"
                }
            },
            "createdDate": 1591994056853,
            "jobId": "2H62ksWAP8rK7yAUlNuI",
            "jobType": "CREATE_TOKEN",
            "status": "ACCEPTED",
            "tokenId": "202006122034"
        }
    ],
    "TRANSFER_TOKEN": [],
    "UPDATE_TOKEN": []
}
```

### Blockchain Data Fields Validation 

When using fields relating to data stored on the blockchain or in relation to blockchain services, 
the following rules defines some basic characteristics about each field:

* `Token ID` - `number` - greater than 0 with no limits
* `Contract address` - `string` of `hexadecimal` characters - `0-9 a-f A-F` - always starts with `0x`, 42 characters in length - a sample `regex` may look like this `/^0x([a-fA-F0-9]{40})$/`
* `Transaction hash` - `string` of `hexadecimal` characters - `0-9 a-f A-F` - always starts with `0x`, 66 characters in length - a sample `regex` may look like this `/^0x([a-fA-F0-9]{64})$/`
* `Date created` - a valid date in the format `YYYY-MM-DD`
* `IPFS link` - a valid URL
* `Etherscan link` - a valid URL
* `OpenSea link` - a valid URL