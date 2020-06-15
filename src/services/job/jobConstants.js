const JOB_TYPES = Object.freeze({
  CREATE_TOKEN: 'CREATE_TOKEN',
  TRANSFER_TOKEN: 'TRANSFER_TOKEN',
  UPDATE_TOKEN: 'UPDATE_TOKEN'
});

const JOB_STATUS = Object.freeze({
  // Stage 1 - accept job
  ACCEPTED: 'ACCEPTED',

  // Stage 2 - Pre processing such as generating metadata on IPFS has completed
  PRE_PROCESSING_COMPLETE: 'PRE_PROCESSING_COMPLETE',
  PRE_PROCESSING_FAILED: 'PRE_PROCESSING_FAILED',

  // Stage 3 - submit txs to network
  TRANSACTION_SENT: 'TRANSACTION_SENT',

  // Stage 4 - check transaction complete/failed
  JOB_COMPLETE: 'JOB_COMPLETE',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
});

const NEXT_STATES = Object.freeze({
  [JOB_STATUS.ACCEPTED]: [JOB_STATUS.PRE_PROCESSING_COMPLETE],
  [JOB_STATUS.PRE_PROCESSING_COMPLETE]: [
    JOB_STATUS.TRANSACTION_SENT, // success
    JOB_STATUS.PRE_PROCESSING_FAILED // failure
  ],
  [JOB_STATUS.TRANSACTION_SENT]: [
    JOB_STATUS.JOB_COMPLETE,  // success
    JOB_STATUS.TRANSACTION_FAILED // failure
  ],
  [JOB_STATUS.JOB_COMPLETE]: [], // No valid transition
  [JOB_STATUS.TRANSACTION_FAILED]: [], // No valid transition
  [JOB_STATUS.PRE_PROCESSING_FAILED]: [], // No valid transition
});

module.exports = {
  JOB_TYPES,
  JOB_STATUS,
  NEXT_STATES
};
