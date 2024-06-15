

document.addEventListener('DOMContentLoaded', () => {
    const messageList = document.querySelector('#messages');
    const messageInput = document.querySelector('#message-input');
    const sendMessageForm = document.querySelector('#send-message-form');
    const searchForm = document.querySelector('#search-form');
    const searchInput = document.querySelector('#search-input');

    if (!sendMessageForm) {
        console.error('sendMessageForm is null');
        return;
    }

    sendMessageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        console.log('Sending message:', message);

        if (message) {
            try {
                const response = await fetch('/send-message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message })
                });

                if (response.ok) {
                    const newMessage = await response.json();
                    addMessageToDOM(newMessage);
                    messageInput.value = '';
                } else {
                    console.error('Error sending message:', await response.text());
                }
            } catch (err) {
                console.error('Error sending message:', err);
            }
        }
    });

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        console.log('Searching for:', query);

        if (query) {
            try {
                console.log('Making fetch request to /search-messages');
                const response = await fetch(`/search-messages?query=${encodeURIComponent(query)}`);
                console.log('Fetch request made');

                if (response.ok) {
                    const searchResults = await response.json();
                    console.log('Search results:', searchResults);
                    updateMessageList(searchResults);
                } else {
                    const errorText = await response.text();
                    console.error('Error searching messages:', errorText);
                }
            } catch (err) {
                console.error('Error searching messages:', err);
            }
        } else {
            console.warn('Search query is empty');
        }
    });

    function addMessageToDOM(message) {
        console.log('Adding message to DOM:', message);
        const messageItem = document.createElement('li');
        messageItem.dataset.id = message._id;
        messageItem.innerHTML = `
            <strong>${message.nickname}</strong>: ${message.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
            <button class="edit-button">Edit</button>
            <button class="delete-button">Delete</button>
        `;
        messageList.appendChild(messageItem);
    }

    function updateMessageList(messages) {
        console.log('Updating message list with:', messages);
        messageList.innerHTML = '';
        messages.forEach(addMessageToDOM);
    }

    messageList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-button')) {
            const messageItem = e.target.closest('li');
            const messageId = messageItem.dataset.id;
            const newText = prompt('Edit your message:', messageItem.querySelector('strong').nextSibling.textContent.trim());

            if (newText) {
                console.log('Editing message:', newText);
                try {
                    const response = await fetch(`/edit-message/${messageId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: newText })
                    });

                    if (response.ok) {
                        messageItem.querySelector('strong').nextSibling.textContent = `: ${newText}`;
                    } else {
                        const errorText = await response.text();
                        console.error('Error editing message:', errorText);
                    }
                } catch (err) {
                    console.error('Error editing message:', err);
                }
            }
        }

        if (e.target.classList.contains('delete-button')) {
            const messageItem = e.target.closest('li');
            const messageId = messageItem.dataset.id;
            console.log('Deleting message:', messageId);
            try {
                const response = await fetch(`/delete-message/${messageId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    messageItem.remove();
                } else {
                    const errorText = await response.text();
                    console.error('Error deleting message:', errorText);
                }
            } catch (err) {
                console.error('Error deleting message:', err);
            }
        }
    });
});
