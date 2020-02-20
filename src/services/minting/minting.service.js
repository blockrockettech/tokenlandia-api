const _ = require('lodash');
const {getContractAddressFromTruffleConf} = require('../../utils/truffle');
const EscrowContractTruffleConf = require('../../truffleconf/escrow/TrustedNftEscrow');

class MintingService {
  constructor(jobQueue, tokenlandiaService) {
    this.jobQueue = jobQueue;
    this.tokenlandiaService = tokenlandiaService;
  }

  async processJob(chainId, jobId) {
    const job = await this.jobQueue.getJobForId(chainId, jobId);
    if (!job) {
      throw new Error('Minting service - processJob() - job does not exist or database error');
    }

    // get context from previous status - ACCEPTED and METADATA_CREATED
    const {context, tokenId} = job;
    const {ACCEPTED, METADATA_CREATED} = context;

    // prep minting params
    const recipient = getContractAddressFromTruffleConf(EscrowContractTruffleConf, chainId);
    const mintArgs = [
      tokenId,
      recipient,
      ACCEPTED.product_code,
      METADATA_CREATED.metadata_ipfs_hash
    ];

    // TODO - change status to SENDING_TRANSACTION and new context
    // TODO - fire TX
    // TODO - change status to TRANSACTION_SENT and new context including TX hash
  }
}

module.exports = MintingService;
