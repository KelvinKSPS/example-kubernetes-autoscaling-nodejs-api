import { check, sleep, group } from 'k6';
import http from "k6/http";

import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";


export let options = {
  duration: "3m",
  vus: 200,
  thresholds: {
    http_req_duration: ["p(95)<700"]
  }
};



// export let options = {
//   thresholds: {
//     http_req_duration: ["p(95)<700"]
//   },
//   stages: [
//     { duration: '10s', target: 50 },
//     { duration: '20s', target: 200 },
//     { duration: '30s', target: 50 },
//     { duration: '30s', target: 0 },
//     { duration: '30s', target: 80 }
//   ],
// };

export default function () {
  // let r = http.get(`${__ENV.ENDPOINT}`);
  // check(r, {
  //   'status is 200': r => r.status === 200,
  // });
  // sleep(3);
  group(`visit devtest event from BEES, Sofist, Sensedia & JetBrains`, function () {
    let r = http.get(`${__ENV.ENDPOINT}/29`);
    check(r, {
      'status is 200': r => r.status === 200,
    });
    sleep(3);
  });

  group(`visit all devtest events`, function () {
    let r = http.get(`${__ENV.ENDPOINT}/29`);
    check(r, {
      'status is 200': r => r.status === 200,
    });
    sleep(3);
  });

}


export function handleSummary(data) {
  return {
    "result_custom.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
    "result.json": JSON.stringify(data)
  };
}