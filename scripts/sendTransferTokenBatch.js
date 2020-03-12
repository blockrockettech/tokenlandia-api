const dotenv = require('dotenv');
const _ = require('lodash');
const axios = require('axios');

if (process.env.NODE_ENV === 'test') {
  console.log(`Applying dotenv config for [${process.env.NODE_ENV}]`);
  const result = dotenv.config({path: `./.env.${process.env.NODE_ENV}`});
  if (result.error) throw result.error;
} else {
  console.log(`Applying default dotenv`);
  const result = dotenv.config({path: './.env'});
  if (result.error) throw result.error;
}

const CHAIN_ID = 4;
const API_HOST = `http://localhost:8080`;

async function addJobToQueue(tokenId) {
  const payload = {
    'token_id': tokenId.toString(),
    'recipient': '0x12D062B19a2DF1920eb9FC28Bd6E9A7E936de4c2'
  };

  console.log('---Firing transfer job---');
  const response = await axios
    .post(`${API_HOST}/v1/network/${CHAIN_ID}/job/submit/transfer?key=${process.env.API_ACCESS_KEY}`, payload)
    .catch(e => {
      if (e.response) {
        console.log(`Could not transfer token [${payload.token_id}]. Failed with ${e.response.status} - ${e.response.data.error}`);
      }
    });

  if (response && response.data.msg) {
    console.log(`TokenID [${payload.token_id}] - Msg`, response.data.msg);
  }
  if (response && response.data.jobId) {
    console.log(`TokenID [${payload.token_id}] - JOb ID`, response.data.jobId);
  }

  console.log('---Done create job---\n');
}

async function processJobs() {

  axios.all([
    axios.get(`${API_HOST}/v1/network/${CHAIN_ID}/job/process/preprocess?key=${process.env.API_ACCESS_KEY}`),
    axios.get(`${API_HOST}/v1/network/${CHAIN_ID}/job/process/transaction?key=${process.env.API_ACCESS_KEY}`),
    axios.get(`${API_HOST}/v1/network/${CHAIN_ID}/job/process/completions?key=${process.env.API_ACCESS_KEY}`),
  ])
    .then(axios.spread((metaResponse, txResponse, completionsResponse) => {
      console.log(`Metadata - ${metaResponse.data.msg} - ${metaResponse.data.status}`);

      console.log(`TX - ${txResponse.data.msg} - ${txResponse.data.status}`);

      console.log(`Completion -${completionsResponse.data.msg} - ${completionsResponse.data.status}`);
      console.log(new Date());
      console.log('\n');
    })).catch(e => console.log(e));
}

(async function runScript() {
  console.log('Test API Script started!\n');

  // Fire create requests
  for (let i = 500; i <= 510; i++) {
    await addJobToQueue(i);
  }

  console.log('Processing will take place now every minute...\n');

  //Set time out for method that processes jobs
  setInterval(processJobs, 10000);
  processJobs();
})();
