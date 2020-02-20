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

  // Stage 2 - push Metadata to IPFS
  METADATA_CREATED: 'METADATA_CREATED',

  // Stage 3 - submit txs to network
  TRANSACTION_SENT: 'TRANSACTION_SENT',

  // Stage 4 - check transaction complete/failed
  JOB_COMPLETE: 'JOB_COMPLETE',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
});


const JOB_STATE_MACHINE = Object.freeze({
  transitions: [
    {
      name: 'stage_0', from: JOB_STATUS.NO_JOB, to: JOB_STATUS.ACCEPTED
    },
    {
      name: 'stage_1', from: JOB_STATUS.ACCEPTED, to: JOB_STATUS.METADATA_CREATED
    },
    {
      name: 'stage_2', from: JOB_STATUS.METADATA_CREATED, to: JOB_STATUS.TRANSACTION_SENT
    },
    {
      name: 'stage_3', from: JOB_STATUS.TRANSACTION_SENT, to: JOB_STATUS.JOB_COMPLETE
    },
    {
      name: 'stage_4', from: JOB_STATUS.TRANSACTION_SENT, to: JOB_STATUS.TRANSACTION_FAILED
    }
  ],
});


module.exports = {
  JOB_TYPES,
  JOB_STATUS
};
