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

async function addCreateJobToQueue(tokenId) {
  const createPayload = {
    'token_id': tokenId.toString(),
    'coo': 'USA',
    'artist_initials': 'RSA',
    'series': '002',
    'design': '0003',
    'name': `token ${tokenId}`,
    'description': `token ${tokenId} description`,
    'image': 'http://preview.tokenlandia.com/wp-content/uploads/2019/11/b8e4d509cb644e254fbc16eb6a53fd48_listingImg_IOznWUjgk6.jpg',
    'artist': 'artist',
    'artist_assistant': 'assistant',
    'brand': 'brand',
    'model': 'model',
    'purchase_location': 'london',
    'purchase_date': '2020-02-01',
    'customization_location': 'tokyo',
    'customization_date': '2020-02-06',
    'material_1': 'a',
    'material_2': 'b',
    'material_3': 'c',
    'material_4': 'd',
    'material_5': 'e',
  };

  const chainId = 4;
  console.log('---Firing create job---');
  const response = await axios
    .post(`https://api-56b6el2v7a-uc.a.run.app/v1/network/${chainId}/job/submit/createtoken/general?key=${process.env.API_ACCESS_KEY}`, createPayload)
    .catch(e => {
      if (e.response) {
        console.log(`Could not create token [${createPayload.token_id}]. Failed with ${e.response.status} - ${e.response.data.error}`);
      }
    });

  if (response && response.data.msg) {
    console.log(`TokenID [${createPayload.token_id}] - Msg`, response.data.msg);
  }
  if (response && response.data.jobId) {
    console.log(`TokenID [${createPayload.token_id}] - JOb ID`, response.data.jobId);
  }

  console.log('---Done create job---\n');
}

async function processJobs() {
  const chainId = 4;

  axios.all([
    axios.get(`http://localhost:8080/v1/network/${chainId}/job/process/metadata`),
    axios.get(`http://localhost:8080/v1/network/${chainId}/job/process/transaction`),
    axios.get(`http://localhost:8080/v1/network/${chainId}/job/process/completions`),
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
  axios.defaults.headers.common['Authorization'] = `Bearer ${process.env.API_ACCESS_KEY}`;

  console.log('Test API Script started!\n');

  // Fire create requests
  for (let i = 514; i <= 515; i++) {
    await addCreateJobToQueue(i);
  }

  console.log('Processing will take place now every minute...\n');

  // Set time out for method that processes jobs
  // setInterval(processJobs, 60000);
  // processJobs();
})();
