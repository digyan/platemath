const CLIENT_ID = '774232714488-6srqp94mi4jpb80hjd72rp9ibmn87r0h.apps.googleusercontent.com'; 
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let gapiInited = false;

function handleClientLoad() {
    // Load the Google API Client Library
    gapi.load('client:auth2', initClient);
}

async function initClient() {
    try {
        // Initialize the Google API Client with OAuth
        await gapi.client.init({
            clientId: CLIENT_ID,
            scope: SCOPES,
        });
        gapiInited = true;
        console.log('Google API Client initialized.');
    } catch (error) {
        console.error('Error initializing Google API Client:', error);
        alert('Failed to initialize Google API. Check console for details.');
    }
}

async function signIn() {
    if (!gapiInited) {
        alert('Google API not initialized yet!');
        return;
    }
    try {
        // Trigger the OAuth sign-in flow
        await gapi.auth2.getAuthInstance().signIn();
        alert('Signed in successfully!');
    } catch (error) {
        console.error('Error signing in:', error);
        alert('Failed to sign in. Please try again.');
    }
}

async function saveData() {
    if (!gapiInited) {
        alert('Google API not initialized yet!');
        return;
    }

    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
        alert('You need to sign in first!');
        return;
    }

    const workoutData = document.getElementById('workoutLog').value;
    if (!workoutData) {
        alert('Please enter your workout log before saving.');
        return;
    }

    const fileContent = new Blob([workoutData], { type: 'text/plain' });
    const metadata = {
        name: `workout_log_${new Date().toISOString()}.txt`,
        mimeType: 'text/plain',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', fileContent);

    try {
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${gapi.auth.getToken().access_token}`,
            },
            body: form,
        });

        if (response.ok) {
            alert('Data saved successfully!');
        } else {
            console.error('Failed to upload file:', response.statusText);
            alert('Failed to save data. Please check your internet connection or Google Drive permissions.');
        }
    } catch (error) {
        console.error('Error saving data to Google Drive:', error);
        alert('An error occurred while saving data. Check console for details.');
    }
}

// Ensures the Google API client is loaded on window load
window.onload = handleClientLoad;
