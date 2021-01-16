app.controller('indexController', ['$scope','indexFactory',($scope,indexFactory) => {
    

    $scope.messages = [];
    $scope.players = { };


    $scope.init = ()=>{
        const username = prompt('Enter username');

        if(username){
            initSocket(username)
        }else{
            return false;
        }
    }

    function scrollTop(){
        setTimeout(() => {
            const element = document.getElementById('chat-area');
            element.scrollTop = element.scrollHeight;
        });
    }
    
    function initSocket(username){
        const connectionOptions = {
            reconnectionAttempts:3,
            reconnectionDelay:600
        }
        
        indexFactory.connectSocket('http://localhost:3000/', connectionOptions)
        .then((socket)=>{
            socket.emit('newUser', {username});

            socket.on('initPlayers', (data)=>{
                $scope.players = data;
                $scope.$apply();
            });

            socket.on('newUser', (data)=>{
                const messageData = {
                    type: {
                        code: 0,
                        message: 1,
                    },
                    username: data.username,
                };
                $scope.messages.push(messageData);
                $scope.players[data.id] = data;
                $scope.$apply();
            });

            socket.on('disUser', (data)=>{
                const messageData = {
                    type: {
                        code:0,
                        message: 0,
                    },
                    username: data.username,
                };
                $scope.messages.push(messageData);
                delete $scope.players[data.id];
                $scope.$apply();
            });

           

            socket.on('animate', (data)=>{
                $('#' + data.socketId).animate({'left': data.x + 'px', 'top':data.y + 'px'}, () =>{
                    animated = false;
                });
            });

            socket.on('nMessage', (data) => {
                $scope.messages.push(data);
                $scope.$apply();
                scrollTop();
            })

            let animated = false;
            $scope.onClickPlayer = ($event) => {
                if(!animated){
                    let x = $event.offsetX;
                    let y = $event.offsetY;

                    socket.emit('animate', {x,y});

                    animated = true;
                    $('#' + socket.id).animate({'left': x, 'top':y}, () =>{
                        animated = false;
                    });
                }
            };

            $scope.newMessage = () => {
                let message = $scope.message;

                const messageData = {
                    type: {
                        code: 1,
                    },
                    username: username,
                    text: message,
                };
                $scope.messages.push(messageData);
                $scope.message = "";

                socket.emit('newMessage', messageData);
                scrollTop();
            }

        }).catch((socket)=>{
            console.log('Error', socket);
        });
    }
}])