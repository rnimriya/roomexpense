import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 10 }, // ramp up to 10 virtual users
    { duration: '30s', target: 30 }, // hold at 30 concurrent users
    { duration: '15s', target: 0 },  // ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<400'], // 95% of requests must complete under 400ms
  },
};

export default function () {
  // 1. Hit application root (redirect checks)
  const resHome = http.get('http://localhost:3000/');
  check(resHome, {
    'root status was 200 or 307': (r) => r.status === 200 || r.status === 307,
  });

  sleep(0.5);

  // 2. Hit login page assets
  const resLogin = http.get('http://localhost:3000/login');
  check(resLogin, {
    'login page loaded successfully': (r) => r.status === 200,
  });

  sleep(1);
}
