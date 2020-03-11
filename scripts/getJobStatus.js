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

async function getSummary(jobId) {

  const chainId = 4;
  console.log(`---Getting job summary [${jobId}]] on chain [${chainId}].---`);
  const response = await axios
    .get(`https://api-56b6el2v7a-uc.a.run.app/v1/network/${chainId}/job/details/${jobId}?key=${process.env.API_ACCESS_KEY}`)
    .catch(e => {
      if (e.response) {
        console.log(`Could get summary for job [${jobId}] on chain [${chainId}]. Failed with ${e.response.status} - ${e.response.data.error}`);
      }
    });

  console.log(`Summary`, response.data);
  console.log('---Done create job---\n');
}

(async function runScript() {
  axios.defaults.headers.common['Authorization'] = `Bearer ${process.env.API_ACCESS_KEY}`;

  console.log('Test API Script started!\n');

  const jobIds = [
    'EEQgvRDg5s0yWAHhy4NP',
    'XHR1wyXWRcp4qL775Pm5',
  ];

  await Promise.all(_.map(jobIds, getSummary));

})();
