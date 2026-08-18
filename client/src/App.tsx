import React, { useEffect, useState } from 'react';
import './App.css';
import './components/ListItem';
import ListItem from './components/ListItem';
import AppHeader from './components/AppHeader';
import PageTitle from './components/PageTitle';

interface iListItem {
  id: number;
  description: string;
}

// Same-origin in production (Express serves this build from /public); the
// Express dev server runs on a different port than "npm start", so use an
// absolute URL locally.
const API_BASE =
  process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [listItems, setListItems] = useState<iListItem[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/list`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data: iListItem[]) => setListItems(data))
      .catch((err) => console.error('Failed to fetch list', err));
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      addToListItems();
    }
  }

  const updateInput = function (userInput: string) {
    setInputValue(userInput);
  };

  const addToListItems = function () {
    if (!inputValue.trim()) {
      return;
    }

    fetch(`${API_BASE}/api/list`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: inputValue }),
    })
      .then((res) => res.json())
      .then((data: iListItem[]) => setListItems(data))
      .catch((err) => console.error('Failed to add item', err));

    setInputValue('');
  };

  const deleteFromListItems = function (id: number) {
    fetch(`${API_BASE}/api/list/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data: iListItem[]) => setListItems(data))
      .catch((err) => console.error('Failed to delete item', err));
  };

  return (
    <div className='App'>
      <AppHeader></AppHeader>
      <div className='container'>
        <PageTitle pageTitle='Daniel Gatto Web App'></PageTitle>
        <div className='row inputArea' id='newItem'>
          Add items to list
        </div>
        <div className='row'>
          <br></br>
        </div>
        <div className='row inputArea'>
          <input
            name='myInput'
            type='text'
            value={inputValue}
            onChange={(event) => updateInput(event.target.value)}
            className='form-control rounded'
            id='usr'
            maxLength={50}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className='row'>
          <br></br>
        </div>
        <div className='row inputArea'>
          <button
            type='button'
            className='btn btn-primary'
            onClick={addToListItems}
          >
            Add Item
          </button>
        </div>

        <div className='inputArea'>
          {listItems.map((item) => (
            <ListItem
              key={item.id}
              itemId={item.id}
              itemText={item.description}
              onDelete={(id: number) => {
                deleteFromListItems(id);
              }}
            ></ListItem>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
