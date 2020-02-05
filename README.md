# TokenLandia API

[![Test Passing](https://github.com/blockrockettech/tokenlandia-api/workflows/Test%20Runner/badge.svg)](https://github.com/blockrockettech/tokenlandia-api/actions)

### Running locally
Install the dependencies: 

    npm i

Fire it up:

    npm run start
    
## Fetching Physical Asset Token Information
You will need the following information to fetch information about a token:
- The chain ID. This will be either:
    - 1 - For the main ethereum network
    - 4 - For the rinkeby test ethereum network
- The token ID or Product ID

You can then hit the following `GET` endpoint:

    /v1/network/{chainId}/asset/{tokenIdOrProductId}
    
Replacing `{chainId}` and `{tokenIdOrProductId}` as appropriate.

### Example request with public facing API
We have deployed the public facing API to the following host:

    https://api-56b6el2v7a-uc.a.run.app/
    
It is a dockerised version of the API hosted by Google Cloud Run.
 
An example `GET` request we could run is:

    https://api-56b6el2v7a-uc.a.run.app/v1/network/4/asset/info/1
    
This is for chain ID `4` / `rinkeby` and token ID `1`. There are 3 tokens (token ID 1-3) minted on rinkeby.

The expected response would be:

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
