const dotenv = require('dotenv');
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
    "token_id": tokenId.toString(),
    "coo": "USA",
    "artist_initials": "RSA",
    "series": 2,
    "design": 3,
    "name": `token ${tokenId}`,
    "description": `token ${tokenId} description`,
    "image": "http://preview.tokenlandia.com/wp-content/uploads/2019/11/b8e4d509cb644e254fbc16eb6a53fd48_listingImg_IOznWUjgk6.jpg",
    "artist": "artist",
    "artist_assistant": "assistant",
    "brand": "brand",
    "model": "model",
    "purchase_location": "london",
    "purchase_date": "2020-02-01",
    "customization_location": "tokyo",
    "customization_date": "2020-02-06",
    "materials_used": [
    "a",
    "b"
  ]};

  const chainId = 4;
  console.log('---Firing create job---');
  const response = await axios
    .post(`http://localhost:8080/v1/network/${chainId}/job/submit/createtoken/general`, createPayload)
    .catch(e => {
      if (e.response) {
        console.log(`Could not create. Failed with ${e.response.status} - ${e.response.data.error}`);
      }
    });
  console.log(response ? response.data.msg : 'No response');
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
  for(let i = 600; i <= 605; i++) {
    await addCreateJobToQueue(i);
  }

  console.log('Processing will take place now every minute...\n');

  // Set time out for method that processes jobs
  setInterval(processJobs, 60000);
})();
