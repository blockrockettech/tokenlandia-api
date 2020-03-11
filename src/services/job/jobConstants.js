const JOB_TYPES = Object.freeze({
  CREATE_TOKEN: 'CREATE_TOKEN',
  TRANSFER_TOKEN: 'TRANSFER_TOKEN',
  UPDATE_TOKEN: 'UPDATE_TOKEN'
});

const JOB_STATUS = Object.freeze({
  // Stage 0 - no job
  NO_JOB: 'NO_JOB',

  // Stage 1 - accept job
  ACCEPTED: 'ACCEPTED',

  // Stage 2 - push Metadata to IPFS (create or update action)
  METADATA_CREATED: 'METADATA_CREATED',

  // Stage 3 - submit txs to network
  TRANSACTION_SENT: 'TRANSACTION_SENT',

  // Stage 4 - check transaction complete/failed
  JOB_COMPLETE: 'JOB_COMPLETE',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
});

module.exports = {
  JOB_TYPES,
  JOB_STATUS
};
