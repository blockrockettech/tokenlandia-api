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

* When ever you see `/network/{chainId}` - `{chainId}` needs to be replaced with one of the following:
    - `1` - For the `main` ethereum network
    - `4` - For the `rinkeby` test ethereum network
    
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

    /v1/network/{chainId}/asset/{tokenIdOrProductId}
    
Replacing `{chainId}` and `{tokenIdOrProductId}` as appropriate.

This will return information about a token ONLY once it has been minted to the blockchain.

For example - this `HTTP` `GET` request we could run is:

    https://api-56b6el2v7a-uc.a.run.app/v1/network/4/asset/info/1
    
This is for chain ID `4` / `rinkeby` and token ID `1`. There are 3 tokens (token ID 1-3) minted on rinkeby.

The expected response would be:

```
{
    product_code: "ASM-JSH-001-0001",
    product_id: "ASM-JSH-001-0001-1",
    token_id: "1",
    token_uri: "https://ipfs.infura.io/ipfs/QmZvyK4dmEFJ4mjpRxEnsstqPcAsNnNRZkdwwJm3DPpTnr",
    open_sea_link: "https://rinkeby.opensea.io/assets/0xD2d84c15Eda5E93aa15f9DDCAA029eaa3f524aDa/1",
    etherscan_link: "https://rinkeby.etherscan.io/token/0xD2d84c15Eda5E93aa15f9DDCAA029eaa3f524aDa?a=1",
    name: "Token 1",
    description: "Token 1 Desc",
    image: "https://ipfs.infura.io/ipfs/QmXhGB4gbUnZgiaFSjL5r8EVHk63JdPasUSQPfZrsJ2cGf",
    type: "PHYSICAL_ASSET",
    created: 1579181406,
    attributes: {
        coo: "ASM",
        initials: "JSH",
        token_id: "1",
        purchase_location: "Token 1 Purchase Loc",
        customization_location: "Token 1 Cust Loc",
        brand: "Token 1 Brand",
        model: "Token 1 Model",
        artist: "Token 1 Art",
        artist_assistant: "Token 1 Assistant",
        material_1: "Cotton",
        product_id: "ASM-JSH-001-0001-1",
        series: "001",
        design: "0001",
        purchase_date: "2020-01-02",
        customization_date: "2020-01-02"
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
* `TRANSACTION_SENT`    - Token transaction has been sent to the blockchain based on the job type
* `JOB_COMPLETE`        - The transaction has been successfully been mined on the blockchain
* `TRANSACTION_FAILED`  - Something has gone wrong and the job has failed

### Job Types

Three types of job exist, each one preforming a different blockchain actions.

* Creating new tokens - [docs](/documents/token/create/CREATE_TOKEN_DOCS.md)

* Updating token metadata - [docs](/documents/token/update/UPDATE_TOKEN_DOCS.md)

* Transferring token - [docs](/documents/token/transfer/TRANSFER_TOKEN_DOCS.md)

Using transactions executed on the `rinkeby` network, we have been able to determine that the above job types require the following amount of gas to execute:
- Minting = 252,488 GAS
- Updating token metadata = 37,823 GAS
- Token transfer = 81,312 GAS

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
