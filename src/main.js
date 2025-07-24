import './style.css'

// Simple counter functionality
let count = 0
const counter = document.createElement('div')
counter.className = 'text-center py-20'

counter.innerHTML = `
  <div class="max-w-md mx-auto">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">
      Vite + Tailwind CSS + Lightning CSS
    </h1>
    <p class="text-gray-600 mb-8">
      Optimized starter template with modern best practices!!
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
`

document.querySelector('#app').appendChild(counter)

document.querySelector('#counter').addEventListener('click', () => {
  count++
  document.querySelector('#counter').textContent = `Count is ${count}`
})