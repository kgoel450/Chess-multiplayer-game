let client;
let userMsg = "";
let messages = [];
let talkMsg = "Talk";
const messageList = document.querySelector(".message-list");

client = new ConvaiClient({
    apiKey: SETTINGS.get("CONVAI-API-KEY"),
    characterId: SETTINGS.get("CHARACTER-ID"),
    enableAudio: true,
});

function reset() {
    client.resetSession();
    userMsg = "";
    messageList.innerHTML = "";
    var messageItem = document.createElement('div');
    messageItem.classList.add('message-item', 'item-primary');
    messageItem.innerHTML = "Hi, How Can I help you."
    messageList.appendChild(messageItem)
    messageList.scrollTop = messageItem.scrollHeight;
}

function talky() {

    if (talkMsg == "Talk") {
        talkMsg = "Stop Talking";
        var responseText = "";
        var finalUserText = "";
        var tempUserText = "";

        //change slashed microphone to open microphone
        const microphoneSlashed = document.querySelector(".microphoneSlashed");
        const microphoneOpen = document.querySelector(".microphoneOpen");
        microphoneSlashed.style.display = "none";
        microphoneOpen.style.display = "block";

        //display update
        var messageItem = document.createElement('div');
        var messageInput = document.querySelector('.inputAi');
        messageItem.classList.add('message-item', 'item-secondary');
        messageItem.innerHTML = "..."
        messageList.appendChild(messageItem)
        messageList.scrollTop = messageItem.scrollHeight;

        client.setResponseCallback(function (response) {
            if (response.hasUserQuery()) {
                var userQuery = response.getUserQuery();
                var textData = userQuery.getTextData();

                if (textData != "") {
                    if (userQuery.getTextData())
                        if (userQuery.getIsFinal()) {
                            finalUserText += userQuery.getTextData();
                            tempUserText = "";
                        } else {
                            tempUserText = userQuery.getTextData();
                        }

                    messageList.removeChild(messageItem);
                    messageItem = document.createElement('div');
                    messageItem.classList.add('message-item', 'item-secondary');
                    messageItem.innerHTML = finalUserText + tempUserText;
                    messageList.appendChild(messageItem);
                    messageList.scrollTop = messageItem.scrollHeight;

                    messageInput.value = "";
                }
                if (userQuery.getEndOfResponse()) {

                    messageItem = document.createElement('div');
                    messageItem.classList.add('message-item', 'item-primary');
                    messageItem.innerHTML = "...";
                    messageList.appendChild(messageItem);
                    messageList.scrollTop = messageItem.scrollHeight;
                }

                userMsg = "";

            }

            if (response.hasAudioResponse()) {
                responseText += response.getAudioResponse().getTextData();

                userMsg = "";


                messageList.removeChild(messageItem);
                messageItem = document.createElement('div');
                messageItem.classList.add('message-item', 'item-primary');
                messageItem.innerHTML = responseText;
                messageList.appendChild(messageItem);
                messageList.scrollTop = messageItem.scrollHeight;
            }
        });

        client.startAudioChunk();
    } else {
        talkMsg = "Talk";
        const microphoneSlashed = document.querySelector(".microphoneSlashed");
        const microphoneOpen = document.querySelector(".microphoneOpen");
        microphoneSlashed.style.display = "block";
        microphoneOpen.style.display = "none";
        client.endAudioChunk();
    }
}

function sendMsg() {
    var responseText = "";

    var messageItem = document.createElement('div');
    var messageInput = document.querySelector('.inputAi');

    messageItem = document.createElement('div');
    messageItem.classList.add('message-item', 'item-secondary');
    messageItem.innerHTML = userMsg;
    messageList.appendChild(messageItem);
    messageList.scrollTop = messageItem.scrollHeight;

    messageInput.value = ""

    messageItem = document.createElement('div');
    messageItem.classList.add('message-item', 'item-primary');
    messageItem.innerHTML = "...";
    messageList.appendChild(messageItem);
    messageList.scrollTop = messageItem.scrollHeight;

    client.setResponseCallback(function (response) {
        if (response.hasAudioResponse()) {

            messageList.removeChild(messageItem);
            messageList.scrollTop = messageItem.scrollHeight;
            responseText += response.getAudioResponse().getTextData();

            messageItem = document.createElement('div');
            messageItem.classList.add('message-item', 'item-primary');
            messageItem.innerHTML = responseText;
            messageList.appendChild(messageItem);
            messageList.scrollTop = messageItem.scrollHeight;
        }
    });
    client.sendTextChunk(userMsg);
}

function handleMsgChange() {
    const inputElement = document.querySelector('.inputAi');
    userMsg = inputElement.value;
}



const inputElement = document.querySelector('.inputAi');
inputElement.addEventListener("keypress", (event) => {

    if(event.key === "Enter") {
        event.preventDefault();
        handleMsgChange();
        sendMsg();
    }
});