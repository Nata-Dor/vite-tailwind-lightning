(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const i of t.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function c(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function s(e){if(e.ep)return;e.ep=!0;const t=c(e);fetch(e.href,t)}})();let n=0;const o=document.createElement("div");o.className="text-center py-20";o.innerHTML=`
  <div class="max-w-md mx-auto">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">
      Vite + Tailwind CSS + Lightning CSS
    </h1>
    <p class="text-gray-600 mb-8">
      Optimized starter template with modern best practices
    </p>
    
    <div class="bg-white rounded-lg shadow-lg p-8">
      <button id="counter" class="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
        Count is 0
      </button>
      
      <div class="mt-6 space-y-2">
        <p class="text-sm text-gray-500">
          Features included:
        </p>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>⚡ Lightning CSS for faster builds</li>
          <li>🎨 Tailwind CSS v4</li>
          <li>📱 Responsive design</li>
          <li>🔧 Modern tooling</li>
        </ul>
      </div>
    </div>
  </div>
`;document.querySelector("#app").appendChild(o);document.querySelector("#counter").addEventListener("click",()=>{n++,document.querySelector("#counter").textContent=`Count is ${n}`});
