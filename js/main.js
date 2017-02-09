'use strict';
window.addEventListener("load", (e)=> 
{
    console.log("Application Started");
    var myApp = Game.getInstance();
});

class Game 
{
    constructor() 
    {
        console.log("game Created");
        Game.images = [];
        Game.house = null;
        Game.screen = document.getElementById("canvas");
        Game.ctx = Game.screen.getContext("2d");
        Game.tick = 0;
        Game.mouse = {};
        Game.alive = true;
        Game.Ticker = null;
        Game.screen.addEventListener("mousemove",(e)=>
        {
            Game.mouse = Utils.getMouse(e,Game.screen);
        });
        Game.flashLight = new FlashLight(Game.ctx,Game.mouse);
        this.key = new Key();
        this.loadAssets(["room_1.jpg", "room_2.jpg", "room_3.jpg", "room_4.jpg" , "room_5.jpg", "room_6.jpg", "room_7.jpg", "room_8.jpg", "room_9.jpg", "room_10.jpg", "room_11.jpg", "room_12.jpg", "room_13.jpg", "room_14.jpg", "room_15.jpg", "room_16.jpg", "room_17.jpg"]); 
        
        Game.bg_music = new Audio("sounds/storm.mp3");
        Game.footstepsCloser = new Audio("sounds/footsteps_closer.mp3");
        Game.footstepsAway = new Audio("sounds/footsteps_away.mp3");
        Game.tantrum = new Audio("sounds/tantrum.mp3");
        Game.doorslam = new Audio("sounds/doorslam.mp3");
        Game.death = new Audio("sounds/gameDeath.wav");
    }

    static EndGame()
    {
       Game.death.cloneNode().play();
       Game.alive = false;
       clearInterval(Game.Ticker);
       document.getElementById("death").removeAttribute("class");
    }

    setup()
    {
        //Loading pictures and the sounds of the house
        //Seeding the rooms to make the house.
        Game.house = new House();
        Game.bg_music.loop = true;
        Game.bg_music.cloneNode().play();

        //Do randomization of where the monster spawns  
        var monsterStartRooms =[16,9,10,2];
        House.monster = new Monster();
        House.monster.room = monsterStartRooms[Math.ceil(Math.random()*monsterStartRooms.length)-1];
        House.monster.room = 16;
        console.log("Monster started in..." + House.monster.room);

        //Bringing the player into the game
        House.player = new Player();
        Game.house.setup();

        Game.ctx.drawImage(Game.house.rooms[0].image, 0,0, 500,500);
        Game.house.hideKey();
        Game.house.hideItems();       
        Game.screen.addEventListener("click", Game.house.doSearch);
        document.getElementById("escape").addEventListener("click", this.escape);
        //Begin the animation cycles
        Game.drawFrame();

        //Calling the game loop to begin
        Game.Ticker = setInterval(this.mainLoop, 1000);
    }

    static getDistance(obj)
    {
        var dx = Game.mouse.x - obj.points["x"];
        var dy = Game.mouse.y - obj.points["y"];
        var d = Math.sqrt(dx*dx+dy*dy);

        return d;
    }

    static drawFrame()
    {
        if(Game.alive == false)
        {
            return;
        }
        /*
            document.getElementById("x").innerHTML = Game.mouse.x;
            document.getElementById("y").innerHTML = Game.mouse.y;
            document.getElementById("room_num").innerHTML = House.player.room;
        */
        window.requestAnimationFrame(Game.drawFrame);
        Game.ctx.clearRect(0,0, Game.screen.width, Game.screen.height);
        Game.ctx.globalCompositeOperation = "source-over";
        Game.ctx.drawImage(Game.house.rooms[House.player.room].image, 0,0,500,500);
        Game.ctx.globalCompositeOperation = "destination-in";
        Game.flashLight.x = Game.mouse.x;
        Game.flashLight.y = Game.mouse.y;
        var overItem = false;
        for(var i=0; i < Game.house.rooms[House.player.room].objects.length; i++)
        {
            var obj = Game.house.rooms[House.player.room].objects[i];
           
            if(Game.getDistance(obj) < Game.flashLight.lightValue)
            {
                overItem = true;

                document.getElementById("searchable").innerHTML = obj.name;
            }
        }
        if(overItem == false)
        {
            document.getElementById("searchable").innerHTML = "";
            
        }       
        Game.flashLight.update();
    }

    escape()
    {
        if(House.player.room == 0)
        {
            if(House.player.inventory.indexOf("houseKey") != -1)
            {
                alert("You have escaped this nightmare!");
            }
            else
            {
                document.getElementById("output").innerHTML = "The door is locked! You must find the key!";
            }
        }   
    }

    loadAssets(arr)
    {
        var count = 0;
        var that = this;
        //Recursive Asset loading function!
        (function loadAsset()
        {
            var img = new Image();
            
            img.src = "imgs/rooms/" + arr[count];

            img.addEventListener("load", function(e)
            {
                Game.images.push(img);
                count++;
                if(count < arr.length)
                {
                    loadAsset();
                }
                else
                {
                    console.log("Images loaded");
                    that.setup();
                }
            });
        })();
    }

    mainLoop()
    {
        Game.tick++;      
        if(Game.tick % 5 == 0)
        {
            document.getElementById("output").innerHTML = "";
        }

        if(Game.tick == 19)
        {
            Game.house.moveMonster();
            Game.tick = 0;
        }
    }

    static getInstance()
    {
        if(!Game._instance)
        {
            Game._instance = new Game();
            return Game._instance;
        }
        else
        {
            throw "Game Singleton already created!";
        }
    }
}

class House
{
    constructor()
    {
        this.rooms = [];
        House.monster = null;
        House.player = null;
    }

    hideKey()
    {
        var x = Math.ceil(Math.random() * 10)+6;
        this.rooms[x].hasKey = true;
        this.rooms[x].itemLocation = this.rooms[x].searchables[Math.ceil(Math.random() *this.rooms[x].searchables.length-1)];
    }

    hideItems()
    {
        var x = Math.ceil(Math.random() *14)+2;

        //Hiding the Candle
        if(this.rooms[x].hasKey != true && this.rooms[x].hasFlashlight != true)
        {
            this.rooms[x].hasCandle = true;
            this.rooms[x].itemLocation = this.rooms[x].searchables[Math.ceil(Math.random() *this.rooms[x].searchables.length-1)];
            console.log("Candle was placed");
        }

        x = Math.ceil(Math.random() *14)+2;
        //Hiding the Flashlight
        if(this.rooms[x].hasKey != true && this.rooms[x].hasCandle != true)
        {
            this.rooms[x].hasFlashlight = true;
            this.rooms[x].itemLocation = this.rooms[x].searchables[Math.ceil(Math.random() *this.rooms[x].searchables.length-1)];
            console.log("Flashlight was placed");
        }
    }

    moveMonster()
    {
        var exits = [];
        var monster_old_exit = House.monster.room;
        var leaving = false;

        //Monster needs to slam door when leaving a room with a player
        //Movin Monster to a valid room!
        for(var i=0; i < Game.house.rooms[House.monster.room].directions.length; i++)
        {
            if(Game.house.rooms[House.monster.room].directions[i] != -1)
            {
                exits.push(Game.house.rooms[House.monster.room].directions[i]);
            }
        }

        House.monster.room = exits[Math.ceil(Math.random() * exits.length-1)];

        if(House.monster.dangerRoom)
        {
            var temp = false;
            for(var i=0; i < Game.house.rooms[House.monster.room].directions.length; i++)
            {
                if(Game.house.rooms[House.monster.room].directions[i] == House.player.room)
                {
                    temp = true;
                }
            }

            if(temp == false)
            {
                House.monster.dangerRoom = false;
                Game.doorslam.cloneNode().play();
                Game.footstepsAway.cloneNode().play();
            }
        }

        //Play footsteps when the monster enters an adjacent room
        for(var i=0; i < Game.house.rooms[House.monster.room].directions.length; i++)
        {
            if(Game.house.rooms[House.monster.room].directions[i] == House.player.room)
            {
                Game.footstepsCloser.cloneNode().play();
                House.monster.dangerRoom = true;
            }
        }

        console.log("Monster now in room #: "+House.monster.room);
        
        if(House.monster.room == House.player.room)
        {
            if(House.player.hiding == true )
            {
                //YOUR HIDDEN AND ALIVE!
                Game.tantrum.cloneNode().play(); 
            }
            else
            {
                Game.EndGame();
                //Your DEAD AND EATEN! JUMP SCARE MA DUDE!
            }
        }

        //Playing the sounds if the player is nearby!!
        exits = [];
        for(var i=0; i < Game.house.rooms[House.monster.room].directions.length; i++)
        {
         
            if(House.player.room == Game.house.rooms[House.monster.room].directions[i])
            {
                Game.footstepsCloser.cloneNode().play();
            }   
        }
    }

    doSearch()
    {
        if(House.player.hiding)
        {
            document.getElementById("output").innerHTML = "You can't search while hiding!";
        }
        else
        {
            var term = document.getElementById("searchable").innerHTML;
            var playerRoom = Game.house.rooms[House.player.room];
            
            if(playerRoom.searchables.indexOf(term) != -1 )
            {
                if(term == playerRoom.itemLocation && playerRoom.hasKey == true )
                {
                    alert("You have found a key...");
                    House.player.getItem("houseKey");
                }
                else if(term == playerRoom.itemLocation && playerRoom.hasCandle == true)
                {
                    alert("You have found a candle...");
                    House.player.getItem("candle");
                }
                else if(term == playerRoom.itemLocation && playerRoom.hasFlashlight == true)
                {
                    alert("You have found a Flashlight...");
                    House.player.getItem("flashlight");
                }
                else
                {
                    document.getElementById("output").innerHTML = "You search and find nothing...";
                }
            }
            else
            {
                document.getElementById("output").innerHTML = "There is nothing to search right there.";
            }
        }        
    }

    setup()
    {
        var tempRooms = [
                            {
                            "number":0, 
                            "directions": [1,4,-1,3],
                            "img" : "room_1.jpg",
                            "search" : ["shelf 1", "shelf 2", "shelf 3", "shelf 4"],
                            "objects" : [{"name":"shelf 1", "points":{"x":105,"y":97}},{"name":"shelf 2", "points":{"x":415,"y":97}},{"name":"shelf 3", "points":{"x":110,"y":436}},{"name":"shelf 4", "points":{"x":412,"y":426}}]
                          },
                            {
                            "number":1, 
                            "directions": [-1,7,0,6],
                            "img" : "room_2.jpg",
                            "search" : ["clock"],
                            "objects" : [{"name":"clock", "points":{"x":452,"y":380}}]
                          },
                            {
                            "number":2, 
                            "directions": [-1,3,-1,-1],
                            "img" : "room_3.jpg",
                            "search" : ["hole"],
                            "objects" : [{"name":"hole", "points":{"x":281,"y":338}}]
                          },
                            {
                            "number":3, 
                            "directions": [-1,0,-1,2],
                            "img" : "room_4.jpg",
                            "search" : ["bush1", "bush2", "wheelbarrel", "well"],
                            "objects" : [{"name":"bush1", "points":{"x":128,"y":89}},{"name":"bush2", "points":{"x":409,"y":94}},{"name":"well", "points":{"x":297,"y":421}},{"name":"wheelbarrel", "points":{"x":376,"y":373}}]
                          },
                            {
                            "number":4, 
                            "directions": [-1,-1,-1,0],
                            "img" : "room_5.jpg",
                            "search" : ["clock", "chest", "cabinet", "crates", "shelves"],
                            "objects" : [{"name":"clock", "points":{"x":153,"y":149}},{"name":"chest", "points":{"x":228,"y":44}},{"name":"crates", "points":{"x":231,"y":426}},{"name":"cabinet", "points":{"x":386,"y":43}},{"name":"shelves", "points":{"x":70,"y":412}}]
                          },
                            {
                            "number":5, 
                            "directions": [8,-1,-1,-1],
                            "img" : "room_6.jpg",
                            "search" : ["piano", "sidetable", "guitar", "floorboard"],
                            "objects" : [{"name":"piano", "points":{"x":115,"y":469}},{"name":"sidetable", "points":{"x":413,"y":460}},{"name":"guitar", "points":{"x":419,"y":193}},{"name":"floorboard", "points":{"x":418,"y":293}}]
                          },
                            {
                            "number":6, 
                            "directions": [11,1,-1,-1],
                            "img" : "room_7.jpg",
                            "search" : ["cabinets 1","cabinets 2", "table", "table 2", "fridge", "sink", "oven"],
                            "objects" : [{"name":"cabinets 1", "points":{"x":52,"y":170}},{"name":"cabinets 2", "points":{"x":128,"y":89}},{"name":"fridge", "points":{"x":390,"y":429}},{"name":"sink", "points":{"x":72,"y":334}},{"name":"oven", "points":{"x":197,"y":433}},{"name":"table", "points":{"x":400,"y":141}},{"name":"table 2", "points":{"x":196,"y":254}}]
                          },
                            {
                            "number":7, 
                            "directions": [12,8,-1,1],
                            "img" : "room_8.jpg",
                            "search" : ["bookshelf", "table", "board", "rug"],
                            "objects" : [{"name":"bookshelf", "points":{"x":54,"y":92}},{"name":"table", "points":{"x":158,"y":360}},{"name":"board", "points":{"x":363,"y":373}},{"name":"rug", "points":{"x":247,"y":213}}]
                          },
                            {
                            "number":8, 
                            "directions": [13,9,5,7],
                            "img" : "room_9.jpg",
                            "search" : ["hole 1", "hole 2", "rug"],
                            "objects" : [{"name":"hole 1", "points":{"x":91,"y":307}},{"name":"hole 2", "points":{"x":391,"y":181}},{"name":"rug", "points":{"x":245,"y":201}}]
                          },  {
                            "number":9, 
                            "directions": [-1,-1,-1,8],
                            "img" : "room_10.jpg",
                            "search" : ["chest", "pillow", "nightstand", "dresser","rug", "hole"],
                            "objects" : [{"name":"chest", "points":{"x":246,"y":260}},{"name":"pillow", "points":{"x":444,"y":290}},{"name":"nightstand", "points":{"x":475,"y":370}},{"name":"dresser", "points":{"x":46,"y":381}},{"name":"rug", "points":{"x":214,"y":69}},{"name":"hole", "points":{"x":285,"y":116}}]
                          },  {
                            "number":10, 
                            "directions": [-1,11,-1,-1],
                            "img" : "room_11.jpg",
                            "search" : ["bench", "basin", "dirt", "dirt2", "stone"],
                            "objects" : [{"name":"bench", "points":{"x":348,"y":411}},{"name":"basin", "points":{"x":128,"y":348}},{"name":"dirt", "points":{"x":106,"y":132}},{"name":"dirt2", "points":{"x":327,"y":139}},{"name":"stone", "points":{"x":351,"y":78}}]
                          },  {
                            "number":11, 
                            "directions": [-1,-1,6,10],
                            "img" : "room_12.jpg",
                            "search" : ["clock", "cabinet", "table", "hole"],
                            "objects" : [{"name":"clock", "points":{"x":62,"y":387}},{"name":"table", "points":{"x":286,"y":247}},{"name":"cabinet", "points":{"x":389,"y":450}},{"name":"hole", "points":{"x":117,"y":228}}]
                          },  {
                            "number":12, 
                            "directions": [14,-1,7,-1],
                            "img" : "room_13.jpg",
                            "search" : ["shelf", "couch","hole","hole 2", "hole 3"],
                            "objects" : [{"name":"shelf", "points":{"x":160,"y":303}},{"name":"couch", "points":{"x":134,"y":104}},{"name":"hole", "points":{"x":109,"y":176}},{"name":"hole 2", "points":{"x":433,"y":302}},{"name":"hole 3", "points":{"x":408,"y":217}}]
                          },  {
                            "number":13, 
                            "directions": [15,-1,8,-1],
                            "img" : "room_14.jpg",
                            "search" : ["shelf 1", "shelf 2", "shelf 3", "shelf 4", "shelf 5", "shelf 6"],
                            "objects" : [{"name":"shelf 1", "points":{"x":156,"y":392}},{"name":"shelf 2", "points":{"x":150,"y":254}},{"name":"shelf 3", "points":{"x":150,"y":121}},{"name":"shelf 4", "points":{"x":331,"y":123}}, {"name":"shelf 5", "points":{"x":280,"y":288}},{"name":"shelf 6", "points":{"x":339,"y":388}}]
                          },  {
                            "number":14, 
                            "directions": [-1,-1,12,-1],
                            "img" : "room_15.jpg",
                            "search" : ["cabinet", "desk", "pillow", "pillow 2"],
                            "objects" : [{"name":"cabinet", "points":{"x":136,"y":59}},{"name":"desk", "points":{"x":163,"y":401}},{"name":"pillow 1", "points":{"x":90,"y":205}},{"name":"pillow 2", "points":{"x":87,"y":292}}]
                          },  {
                            "number":15, 
                            "directions": [-1,16,13,-1],
                            "img" : "room_16.jpg",
                            "search" : ["bookshelf", "bookshelf 2", "bookshelf 3", "bookshelf 4", "fireplace", "clock"],
                            "objects" : [{"name":"bookshelf", "points":{"x":161,"y":50}},{"name":"bookshelf 2", "points":{"x":322,"y":46}},{"name":"bookshelf 3", "points":{"x":422,"y":447}},{"name":"bookshelf 4", "points":{"x":115,"y":447}},{"name":"clock", "points":{"x":67,"y":390}}]
                          }, 
                          {
                            "number":16, 
                            "directions": [-1,-1,-1,15],
                            "img" : "room_17.jpg",
                            "search" : ["well", "plants", "cracks"],
                            "objects" : [{"name":"well", "points":{"x":257,"y":236}},{"name":"plants", "points":{"x":159,"y":372}},{"name":"cracks", "points":{"x":373,"y":313}}]
                          }
                        ];
        for(var i=0; i < tempRooms.length;i++)
        {
            this.rooms.push(new Room(tempRooms[i].number, tempRooms[i].directions, Game.images[i], tempRooms[i].search, tempRooms[i].objects));
        }
    }
}

class Room
{
    constructor(num, dir, img, search, objs)
    {
        this.number = num;
        this.directions = dir;
        this.image = img;
        this.searchables = search;
        this.objects = objs;
        this.hasKey = false;
        this.hasCandle = false;
        this.hasFlashlight = false;
    }
}

class Monster
{
    constructor()
    {
        this.dangerRoom = false;
        this.room = 0;
    }
}

class Player
{
    constructor()
    {
        this.room = 0;
        this.health = 100;
        this.sanity = 100;
        this.hiding = false;
        this.status = [];
        this.status["alive"] = true;
        this.status["sane"] =  true;
        this.lightSource = "lighter";
        this.inventory = [];
    }

    getItem(item)
    {
        if(item == "houseKey")
        {
            this.inventory.push(item);
            document.getElementById("inventory").innerHTML += "<image class='items' src='imgs/key.png'>";
        }
        else if(item == "candle")
        {
            if(this.lightSource != "flashlight")
            this.lightSource = "candle";
            document.getElementById("inventory").innerHTML += "<image class='items' src='imgs/candle.png'>";
        }
        else if(item == "flashlight")
        {
            this.lightSource = "flashlight";
            document.getElementById("inventory").innerHTML += "<image class='items' src='imgs/flashlight.png'>";
        }
    }

    useItem(item)
    {
        if(this.inventory.indexOf(item) != -1)
        {
            this.inventory.splice(this.inventory.indexOf(item),1);
        }
    }

    tryMove(code)
    {

        var changed = false;

        //Add in if monster is in room, you get got!

        if(House.player.hiding == true)
        {
            document.getElementById("output").innerHTML = "You can move while hidden!";
            return;
        }

        if(code == "ArrowRight")
        {
            if(Game.house.rooms[this.room].directions[1] != -1)
            {
                changed = true;
                this.room = Game.house.rooms[this.room].directions[1];
            }
        }   
        else if(code == "ArrowLeft")
        {
            if(Game.house.rooms[this.room].directions[3] != -1)
            {
                changed = true;
                this.room = Game.house.rooms[this.room].directions[3];
            }
        }   
        else if(code == "ArrowUp")
        {
            if(Game.house.rooms[this.room].directions[0] != -1)
            {
                changed = true;
                this.room = Game.house.rooms[this.room].directions[0];        
            }
        }  
        else if(code == "ArrowDown")
        {
            if(Game.house.rooms[this.room].directions[2] != -1)
            {
                changed = true;
                this.room = Game.house.rooms[this.room].directions[2];       
            }
        }

        //Check to see if the player just walked into the monsters room.....
        if(House.player.room == House.monster.room)
        {
            //Do the dying!
            Game.EndGame();
        }

        if(changed == true)
        {

            for(var i=0; i < Game.house.rooms[House.player.room].directions.length; i++)
            {
             
                if(House.monster.room == Game.house.rooms[House.player.room].directions[i])
                {
                    Game.footstepsCloser.cloneNode().play();
                    House.monster.dangerRoom = true;
                }   
            }
            Game.ctx.drawImage(Game.house.rooms[this.room].image, 0,0, 500,500);
            (function start()
            {
                Game.flashLight.x=400;
                Game.flashLight.y=300;
                Game.drawFrame();
            })();
        }
     
        if(House.player.room == 0)
        {
            document.getElementById("escape").removeAttribute("class");
        }
        else
        {
            document.getElementById("escape").setAttribute("class", "hidden")
        }
    }
}




class FlashLight
{
    constructor(ctx,mouse)
    {
        this.ctx = ctx;
        this.x=0;
        this.y=0;
    }

    draw()
    {
        var lightValue = 40;

        this.ctx.save();
        this.ctx.translate(this.x,this.y);
        this.ctx.beginPath();
        this.lightValue = 40;

        //Size of the flash light goes in here!

        if(House.player.lightSource == "lighter")
        {
            lightValue = 40;
        }
        else if(House.player.lightSource == "candle")
        {
            lightValue = 60;
        }
        else if(House.player.lightSource == "flashlight")
        {
            lightValue = 90;
        }
        /*
        else if(House.player.lightSource == "none");
        {
            lightValue = 0;
        }
        */
        this.ctx.arc(0, 0 ,lightValue, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = "red";
        this.ctx.fill();
        this.ctx.restore();
    }

    update()
    {
        this.draw();
    }
}

class Key
{
    constructor()
    {
        Key.keys = [];
        Key.init();
        for(var i = 0; i < 100; i++)
        {
            Key.keys[i] = 0;
        }
    }

    static init()
    {
        window.addEventListener("keydown", function(e)
        {
            Key.keys[e.keyCode] = 1;
            if(e.keyCode == 13)
            {
                Game.house.doSearch();
            }

            if(e.keyCode == 16)
            {
                House.player.hiding = true;
                Game.ctx.fillRect(0,0,500,500);
                Game.ctx.stroke();     
                //Game.light = House.player.lightSource;
                //House.player.lightSource = "none";
                document.getElementById("hiding").removeAttribute("class");
            }
        });

        window.addEventListener("keyup", function(e)
        {
            Key.keys[e.keyCode] = 0;
            //This is the shift button, it does the hiding!
            if(e.keyCode == 16)
            {
                //If monster is in room and you unhide, you do the die-ing
                if(House.monster.room == House.player.room)
                {
                    Game.EndGame();
                }
                Game.ctx.drawImage(Game.house.rooms[House.player.room].image, 0,0, 500,500);
                House.player.hiding = false;
                //House.player.lightSource = Game.light;
                document.getElementById("hiding").setAttribute("class", "hidden");
            }
            else
            {
                House.player.tryMove(e.code);
            }
        });  
    }
}