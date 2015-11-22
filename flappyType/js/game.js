var WordList = ["JAKARTA", "SURABAYA", "BANDUNG", "BEKASI", "MEDAN", "TANGERANG", "DEPOK", "SEMARANG", "PALEMBANG", "MAKASSAR", "TANGERANG", "BOGOR", "BATAM", "PEKANBARU", "BANDAR", "MALANG", "PADANG", "DENPASAR", "SAMARINDA", "SERANG", "BANJARMASIN", "TASIKMALAYA", "PONTIANAK", "CIMAHI", "BALIKPAPAN", "JAMBI", "SURAKARTA", "MATARAM", "MANADO", "YOGYAKARTA", "CILEGON", "KUPANG", "PALU", "AMBON", "TARAKAN", "CIREBON", "BENGKULU", "PEKALONGAN", "KEDIRI", "TEGAL", "BINJAI", "PEMATANGSIANTAR", "JAYAPURA", "BANDA", "PALANGKARAYA", "PROBOLINGGO", "BANJARBARU", "PASURUAN", "TANJUNGPINANG", "GORONTALO", "DUMAI", "MADIUN", "BATU", "SALATIGA", "PANGKALPINANG", "LUBUKLINGGAU", "TERNATE", "BITUNG", "TANJUNGBALAI", "TEBINGTINGGI", "METRO", "BONTANG", "PADANG", "BLITAR", "LHOKSEUMAWE", "SINGKAWANG", "PAREPARE", "LANGSA", "BANJAR", "PRABUMULIH", "MOJOKERTO", "MAGELANG", "SORONG", "PALOPO", "BIMA", "BUKITTINGGI", "BAU"]

var AppGame = (function (window, canvas, undefined) {
    var max_width = canvas.width,
        max_height= canvas.height,
        current_challenge;

    var ctx  = canvas.getContext('2d');
    ctx.font = 'bold 33px flappyFont'; 

    var __initGame = function(){
        letters                 = "AS ",
        level                   = 0,
        char_px                 = 40,
        score                   = 0,
        letter_delay            = 80, //100
        min_letter_delay        = 0; //20
        game_started            = true,
        deathSound              = new Audio("assets/sfx_hit.ogg"), // buffers automatically when created
        hitLetterSound          = new Audio("assets/sfx_wing.ogg");
        hitWrongLetterSound          = new Audio("assets/sfx_die.ogg");
        levelUpSound                 = new Audio("assets/sfx_point.ogg");
        firstWord = true;
    }

    var LetterSprite = function(pos, x_start, cur_char){
        this.character = cur_char
        this.x = x_start + (char_px * pos);
        this.y = 100;
        this.color = "#DED895";
    };

    LetterSprite.prototype.render = function(){
        ctx.fillStyle = "#543847";
        ctx.font = '60px flappyFont';
        ctx.fillText(this.character, this.x, this.y);
    }

    var WordChallenge = function(appGame){
        this.app = appGame;
        this.sequence = [];

        var choice = ~~(( Math.random() * WordList.length ) - 1) 
        var cur_word = WordList[choice].split('');
        var x_start = ~~(Math.random() * (max_width - (cur_word.length * char_px))) - 1;
        for(var i = 0; i < cur_word.length; i++){
            var ll = new LetterSprite(i, x_start, cur_word[i]);
            this.sequence.push(ll);
        }

        // if(score % 10 === 0){
            level++;
            letter_delay -= letter_delay/10;
            letter_delay = Math.max(letter_delay, min_letter_delay);
            console.log("letter_delay = ", letter_delay);
        // }

        this.__interval = setInterval(function(){
            if(current_challenge.sequence.length > 0){
                current_challenge.sequence[0].y += 2.5;
            }
        },letter_delay);
        if(!firstWord){
            if(!levelUpSound.ended){
                levelUpSound.pause();
                levelUpSound.currentTime = 0;    
            }
            levelUpSound.play() 
        }
        firstWord=false;
    };

    WordChallenge.prototype.match = function(c){
        if(this.sequence[0].character === c){
            this.sequence.splice(0,1);
            score += 5;
            if(!hitLetterSound.ended){
                hitLetterSound.pause();
                hitLetterSound.currentTime = 0;    
            }
            hitLetterSound.play();
        }else{
            if(!hitWrongLetterSound.ended){
                hitWrongLetterSound.pause();
                hitWrongLetterSound.currentTime = 0;    
            }
            hitWrongLetterSound.play();
            score -= 5;
        }
    };

    WordChallenge.prototype.checkDeadLetter = function(){
        if(this.sequence[0].y > 400){
            __gameOver();
        }
    };  
    WordChallenge.prototype.render = function(){
        for(var i in this.sequence){
            this.sequence[i].render();
        }
        this.checkDeadLetter();
    }

    var app = {};
    __evaluateKey = function(c){
        current_challenge.match(c);
    };
    __gameOver = function(){
        game_started = false;
        deathSound.play();
        deathSound.addEventListener('ended', function(){
            hitWrongLetterSound.play();
            var image  = new Image();
            image.onload = function() {
               ctx.drawImage(image, 150, 70);
            };
            image.src = "assets/end1.png";
            clearInterval(current_challenge.__interval);
        });              

    }

    app.RestartGame = function(){
        __initGame();
        game_started = true;
        current_challenge = new WordChallenge();
        this.Render();
    };

    app.StartGame = function(){
        __initGame();
        game_started = true;
        window.document.addEventListener( "keydown", function (e){
            if(game_started){
                if(e.keyCode >= 60 && e.keyCode<= 90 || e.keyCode == 32){
                    var c = String.fromCharCode(e.keyCode);
                    __evaluateKey(c);
                }
            }
        }, true);
        current_challenge = new WordChallenge();
        this.Render();
    };

    app.Render = function(){
        if(game_started){
            ctx.save();
            ctx.clearRect(0,0,max_width, max_height);

            ctx.fillStyle = "#4EC0CA";
            ctx.fillRect(0,0,max_width,max_height);


            ctx.fillStyle = "black";
            ctx.font = 'bold 33px flappyFont';
            ctx.fillText("SCORE: "+score, 5, 30);
            ctx.fillText("LEVEL: "+ level, 5, 60);
            ctx.fillStyle = "#DED895";
            ctx.fillRect(0,405,max_width,112);

            var imgBg = new Image();
            imgBg.src = "assets/sky.png";
            ctx.drawImage(imgBg,0,310);
            ctx.drawImage(imgBg,276,310);
            ctx.drawImage(imgBg,552,310);

            var imgTanah = new Image();
            imgTanah.src = "assets/land.png";

            ctx.drawImage(imgTanah,0,405);
            ctx.drawImage(imgTanah,336,405);
            ctx.drawImage(imgTanah,672,405);
            
            if(current_challenge.sequence.length == 0){
                clearInterval(current_challenge.__interval);
                current_challenge = new WordChallenge(this);
            }

            current_challenge.render();

            ctx.restore();
            window.requestAnimationFrame(AppGame.Render);
        }
    };
    return app;
}(window, document.getElementById('game-canvas'), undefined));
