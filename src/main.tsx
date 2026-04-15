import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const loadKakaoSDK = () => {
  const script = document.createElement('script');
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&autoload=false`;
  script.onload = () => {
    (window as any).kakao.maps.load(() => {
      console.log('카카오맵 SDK 로드 완료');
    });
  };
  document.head.appendChild(script);
};

loadKakaoSDK();

const loadKakaoShareSDK = () => {
  const script = document.createElement('script');
  script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
  script.crossOrigin = 'anonymous';
  script.onload = () => {
    if (!(window as any).Kakao.isInitialized()) {
      (window as any).Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
      console.log('카카오 JS SDK 초기화 완료');
    }
  };
  document.head.appendChild(script);
};

loadKakaoShareSDK();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
