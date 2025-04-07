document.addEventListener('DOMContentLoaded', function() {
    // App state
    const state = {
      options: [],
      result: null,
      history: [],
      categories: [
        { name: 'What to do today', options: ['Study', 'Sleep', 'Read a book', 'Go for a walk', 'Scroll TikTok'] },
        { name: 'What to eat', options: ['Pizza', 'Salad', 'Burger', 'Ramen', 'Sandwich'] },
        { name: 'Which subject to study', options: ['Math', 'History', 'Science', 'Literature', 'Programming'] },
        { name: 'Random motivation', options: ['You got this!', 'Just do it!', 'One step at a time', 'Believe in yourself', 'Keep pushing forward'] }
      ],
      activeCategory: null
    };
    
    // Load saved data from local storage
    loadFromLocalStorage();
    
    // DOM elements
    const optionInput = document.getElementById('optionInput');
    const addBtn = document.getElementById('addBtn');
    const optionsList = document.getElementById('optionsList');
    const decideBtn = document.getElementById('decideBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultContainer = document.getElementById('resultContainer');
    const resultLabel = document.getElementById('resultLabel');
    const result = document.getElementById('result');
    const categorySelector = document.getElementById('categorySelector');
    const historyList = document.getElementById('historyList');
    
    // Initialize UI
    result.style.display = 'none';
    renderCategories();
    renderOptions();
    renderHistory();
    
    // Event listeners
    addBtn.addEventListener('click', addOption);
    optionInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        addOption();
      }
    });
    
    decideBtn.addEventListener('click', makeDecision);
    resetBtn.addEventListener('click', resetOptions);
    
    // Functions
    function addOption() {
      const option = optionInput.value.trim();
      
      if (option !== '') {
        state.options.push(option);
        optionInput.value = '';
        
        // If a category is active, update its options
        if (state.activeCategory !== null) {
          state.categories[state.activeCategory].options = [...state.options];
        }
        
        renderOptions();
        saveToLocalStorage();
      }
    }
    
    function renderOptions() {
      optionsList.innerHTML = '';
      
      if (state.options.length === 0) {
        optionsList.innerHTML = '<p>Add some options to get started</p>';
        return;
      }
      
      state.options.forEach((option, index) => {
        const optionItem = document.createElement('div');
        optionItem.className = 'option-item';
        
        const optionText = document.createElement('span');
        optionText.textContent = option;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '&times;';
        removeBtn.onclick = () => removeOption(index);
        
        optionItem.appendChild(optionText);
        optionItem.appendChild(removeBtn);
        optionsList.appendChild(optionItem);
      });
    }
    
    function removeOption(index) {
      state.options.splice(index, 1);
      
      // If a category is active, update its options
      if (state.activeCategory !== null) {
        state.categories[state.activeCategory].options = [...state.options];
      }
      
      renderOptions();
      saveToLocalStorage();
    }
    
    function makeDecision() {
      if (state.options.length === 0) {
        result.textContent = "Add some options first!";
        result.style.display = 'inline-block';
        resultLabel.textContent = "";
        
        result.classList.add('shake');
        setTimeout(() => {
          result.classList.remove('shake');
        }, 500);
        return;
      }
      
      // Start decision animation
      result.style.display = 'none';
      resultLabel.textContent = "Thinking...";
      
      decideBtn.disabled = true;
      decideBtn.classList.add('rotate');
      
      // Random delay for dramatic effect
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * state.options.length);
        state.result = state.options[randomIndex];
        
        // Add to history
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        state.history.unshift({
          option: state.result,
          time: timeString,
          date: now.toLocaleDateString()
        });
        
        // Limit history to 10 items
        if (state.history.length > 10) {
          state.history.pop();
        }
        
        // Show result
        resultLabel.textContent = "Your decision:";
        result.textContent = state.result;
        result.style.display = 'inline-block';
        result.classList.add('result-animation');
        
        // Reset animation classes
        decideBtn.disabled = false;
        decideBtn.classList.remove('rotate');
        
        setTimeout(() => {
          result.classList.remove('result-animation');
        }, 500);
        
        renderHistory();
        saveToLocalStorage();
      }, 1000);
    }
    
    function resetOptions() {
      state.options = [];
      state.result = null;
      state.activeCategory = null;
      
      // Update UI
      renderOptions();
      renderCategories();
      result.style.display = 'none';
      resultLabel.textContent = '';
      
      saveToLocalStorage();
    }
    
    function renderCategories() {
      categorySelector.innerHTML = '';
      
      const allCategoriesBtn = document.createElement('button');
      allCategoriesBtn.className = 'category-btn' + (state.activeCategory === null ? ' active' : '');
      allCategoriesBtn.textContent = 'Custom';
      allCategoriesBtn.onclick = () => selectCategory(null);
      categorySelector.appendChild(allCategoriesBtn);
      
      state.categories.forEach((category, index) => {
        const categoryBtn = document.createElement('button');
        categoryBtn.className = 'category-btn' + (state.activeCategory === index ? ' active' : '');
        categoryBtn.textContent = category.name;
        categoryBtn.onclick = () => selectCategory(index);
        categorySelector.appendChild(categoryBtn);
      });
    }
    
    function selectCategory(index) {
      state.activeCategory = index;
      
      if (index !== null) {
        state.options = [...state.categories[index].options];
      } else {
        state.options = [];
      }
      
      renderCategories();
      renderOptions();
      saveToLocalStorage();
    }
    
    function renderHistory() {
      historyList.innerHTML = '';
      
      if (state.history.length === 0) {
        historyList.innerHTML = '<p>No decisions yet</p>';
        return;
      }
      
      state.history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const historyText = document.createElement('span');
        historyText.textContent = item.option;
        
        const historyTime = document.createElement('span');
        historyTime.className = 'history-item-time';
        historyTime.textContent = item.time;
        
        historyItem.appendChild(historyText);
        historyItem.appendChild(historyTime);
        historyList.appendChild(historyItem);
      });
    }
    
    function saveToLocalStorage() {
      const dataToSave = {
        options: state.options,
        categories: state.categories,
        activeCategory: state.activeCategory,
        history: state.history
      };
      
      localStorage.setItem('decisionDriftData', JSON.stringify(dataToSave));
    }
    
    function loadFromLocalStorage() {
      const savedData = localStorage.getItem('decisionDriftData');
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        state.options = parsedData.options || [];
        state.categories = parsedData.categories || state.categories;
        state.activeCategory = parsedData.activeCategory;
        state.history = parsedData.history || [];
      }
    }
  });