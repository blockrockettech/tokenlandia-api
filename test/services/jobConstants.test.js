const {
  JOB_STATUS,
  canCancelJob,
  canMoveToStatus
} = require('../../src/services/job/jobConstants');

describe('Job constants', async function () {

  describe('canMoveToStatus', async function () {

    describe('ACCEPTED', async function () {
      it('success', async function () {
        [JOB_STATUS.PRE_PROCESSING_COMPLETE, JOB_STATUS.JOB_CANCELLED].forEach((status) => {
          canMoveToStatus(JOB_STATUS.ACCEPTED, status).should.be.true;
        });
      });

      it('failure', async function () {
        [
          JOB_STATUS.ACCEPTED,
          JOB_STATUS.PRE_PROCESSING_FAILED,
          JOB_STATUS.TRANSACTION_SENT,
          JOB_STATUS.JOB_COMPLETE,
          JOB_STATUS.TRANSACTION_FAILED
        ].forEach((status) => {
          canMoveToStatus(JOB_STATUS.ACCEPTED, status).should.be.false;
        });
      });
    });

    describe('PRE_PROCESSING_COMPLETE', async function () {
      it('success', async function () {
        [JOB_STATUS.TRANSACTION_SENT, JOB_STATUS.PRE_PROCESSING_FAILED].forEach((status) => {
          canMoveToStatus(JOB_STATUS.PRE_PROCESSING_COMPLETE, status).should.be.true;
        });
      });

      it('failure', async function () {
        [
          JOB_STATUS.ACCEPTED,
          JOB_STATUS.PRE_PROCESSING_COMPLETE,
          JOB_STATUS.JOB_COMPLETE,
          JOB_STATUS.JOB_CANCELLED,
          JOB_STATUS.TRANSACTION_FAILED
        ].forEach((status) => {
          canMoveToStatus(JOB_STATUS.PRE_PROCESSING_COMPLETE, status).should.be.false;
        });
      });
    });

    describe('TRANSACTION_SENT', async function () {
      it('success', async function () {
        [JOB_STATUS.JOB_COMPLETE, JOB_STATUS.TRANSACTION_FAILED].forEach((status) => {
          canMoveToStatus(JOB_STATUS.TRANSACTION_SENT, status).should.be.true;
        });
      });

      it('failure', async function () {
        [
          JOB_STATUS.ACCEPTED,
          JOB_STATUS.PRE_PROCESSING_COMPLETE,
          JOB_STATUS.JOB_CANCELLED,
          JOB_STATUS.PRE_PROCESSING_FAILED,
        ].forEach((status) => {
          canMoveToStatus(JOB_STATUS.TRANSACTION_SENT, status).should.be.false;
        });
      });
    });

    describe('JOB_COMPLETE', async function () {
      it('no transitions', async function () {
        [
          JOB_STATUS.ACCEPTED,
          JOB_STATUS.PRE_PROCESSING_COMPLETE,
          JOB_STATUS.JOB_CANCELLED,
          JOB_STATUS.TRANSACTION_SENT,
          JOB_STATUS.TRANSACTION_FAILED,
          JOB_STATUS.PRE_PROCESSING_FAILED,
        ].forEach((status) => {
          canMoveToStatus(JOB_STATUS.JOB_COMPLETE, status).should.be.false;
        });
      });
    });

    describe('TRANSACTION_FAILED', async function () {
      it('no transitions', async function () {
        [
          JOB_STATUS.ACCEPTED,
          JOB_STATUS.PRE_PROCESSING_COMPLETE,
          JOB_STATUS.JOB_CANCELLED,
          JOB_STATUS.TRANSACTION_SENT,
          JOB_STATUS.JOB_COMPLETE,
          JOB_STATUS.PRE_PROCESSING_FAILED,
        ].forEach((status) => {
          canMoveToStatus(JOB_STATUS.TRANSACTION_FAILED, status).should.be.false;
        });
      });
    });

    describe('PRE_PROCESSING_FAILED', async function () {
      it('no transitions', async function () {
        [
          JOB_STATUS.ACCEPTED,
          JOB_STATUS.PRE_PROCESSING_COMPLETE,
          JOB_STATUS.JOB_CANCELLED,
          JOB_STATUS.TRANSACTION_SENT,
          JOB_STATUS.JOB_COMPLETE,
          JOB_STATUS.TRANSACTION_FAILED,
        ].forEach((status) => {
          canMoveToStatus(JOB_STATUS.PRE_PROCESSING_FAILED, status).should.be.false;
        });
      });
    });

    describe('JOB_CANCELLED', async function () {
      it('no transitions', async function () {
        [
          JOB_STATUS.ACCEPTED,
          JOB_STATUS.PRE_PROCESSING_COMPLETE,
          JOB_STATUS.PRE_PROCESSING_FAILED,
          JOB_STATUS.TRANSACTION_SENT,
          JOB_STATUS.JOB_COMPLETE,
          JOB_STATUS.TRANSACTION_FAILED,
        ].forEach((status) => {
          canMoveToStatus(JOB_STATUS.JOB_CANCELLED, status).should.be.false;
        });
      });
    });

  });

  describe('canCancelJob', async function () {

    it('can cancel job', async function () {
      [JOB_STATUS.ACCEPTED].forEach((status) => {
        canCancelJob(status).should.be.true;
      });
    });

    it('cannot cancel a job', async function () {
      [
        JOB_STATUS.JOB_CANCELLED,
        JOB_STATUS.PRE_PROCESSING_COMPLETE,
        JOB_STATUS.PRE_PROCESSING_FAILED,
        JOB_STATUS.TRANSACTION_SENT,
        JOB_STATUS.JOB_COMPLETE,
        JOB_STATUS.TRANSACTION_FAILED,
      ].forEach((status) => {
        canCancelJob(status).should.be.false;
      });
    });

  });

});
