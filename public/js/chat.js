const socket = io();

/// starting with $ means its a dom element
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

////// templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
//////



socket.on("message", (message) => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    });

    $messages.insertAdjacentHTML('beforeend', html);

})

socket.on('locationMessage', ({location,createdAt}) => {
    const html = Mustache.render(locationMessageTemplate, {
        location,
        createdAt: moment(createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault(); ///so that the page doesn't refresh
    $messageFormButton.setAttribute('disabled', 'disabled');
    const msg = $messageFormInput.value;

    socket.emit('sendMessage', msg, (msgFromAcknowledgement) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = "";
        $messageFormInput.focus();
        if(msgFromAcknowledgement)
            return console.log(msgFromAcknowledgement);
        
        console.log('message delivered');
    });

})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation)
        return alert('location not available');
    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {
            $sendLocationButton.removeAttribute('disabled');
            if (error) return console.log(error);
            console.log('Location shared');
        })
    })
})