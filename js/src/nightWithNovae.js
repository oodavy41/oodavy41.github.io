(function () {
    'use strict';

    var hoverFlag = false;
    var animateSpeed = 0.004,
        rotateSpeed = 0.0003;
    var width = 200,
        height = 200;

    $('.logo-wrapper').hover(function () {
        hoverFlag = true;
    }, function () {
        hoverFlag = false;
    })
    var cavcc = $('.star');
    cavcc.attr({
        'width': width,
        'height': height,
    })
    cavcc.css('left', 410 - width / 2);
    cavcc.css('top', 65 - height / 2);
    cavcc = cavcc[0];
    var starImg = $('<img src="/imgs/star.svg" width="10px" style=" display:none">')[0];
    var ctemp = $('<canvas></canvas>')
    ctemp.css({
        'width': '15px',
        'height': '15px',
        'display': 'none',
    });
    ctemp = ctemp[0];
    var temp = ctemp.getContext('2d');
    var cc = cavcc.getContext('2d');

    // position zero
    var w, h;
    w = h = cavcc.clientWidth / 2
    var tempLength = 15;
    // animate settings
    var progress = 0;
    var angle = 0;
    var rad = 0.4 * w;
    var colors = [
        [0, 102, 255],
        [255, 203, 195],
        [235, 255, 170],
        [162, 178, 110],
        [195, 126, 246],
        [249, 145, 137],
        [192, 251, 148],
        [159, 246, 253],
        [170, 248, 254]
    ];

    var time = Date.now();
    requestAnimationFrame(draw);

    function draw() {
        var now = Date.now()
        var delta = now - time;
        time = now;

        cc.clearRect(0, 0, cavcc.width, cavcc.height);

        if (progress != 0) {
            var points = [];
            var setp = 2 * Math.PI / 5;
            for (var i = 0; i < 5; i++) {
                points.push([rad * Math.sin(angle + i * setp), rad * Math.cos(angle + i * setp)])
            }

            cc.save();
            cc.beginPath();

            cc.shadowOffsetX = 0;
            cc.shadowOffsetY = 3;
            cc.shadowBlur = 15;
            cc.shadowColor = `rgba(0, 100, 255, ${progress/8})`;

            cc.lineWidth = 5;
            cc.lineCap = 'round';
            cc.lineJoin = 'round';
            cc.globalCompositeOperation = 'light';
            cc.strokeStyle = `rgba(170, 204, 255, ${progress/8})`;
            cc.moveTo(w + points[0][0], h - points[0][1]);
            var point;
            var map = [0, 2, 4, 1, 3, 0];
            for (var i = 0; i < 5; i++) {
                if (progress > i) {
                    point = lerp(points[map[i]], points[map[i + 1]], Math.min(progress - i, 1));
                    cc.lineTo(w + point[0], h - point[1]);
                }
            }
            cc.stroke();

            cc.strokeStyle = `rgba(170, 204, 255, ${(progress-9)/8})`;
            if (progress > 9) {
                cc.arc(w + 0, h + 0, rad, angle - Math.PI / 2, angle + Math.PI * 1.5,
                    false);
            }
            cc.stroke();
            cc.restore();
        }

        if (progress > -1) {
            if (Math.random() > 0.98) {
                addStar(RAIN);
            }
        }
        if (point !== undefined && progress < 5 && hoverFlag) {
            addStar(EXPO, w + point[0], h - point[1], Math.atan2(-point[1], point[0]));
        }
        for (i in exploding) {
            exploding[i].draw(delta, temp, cc, progress > 5.5 || !hoverFlag);
        }
        for (i in twinkling) {
            twinkling[i].draw(delta, temp, cc);
        }


        // animate
        progress += hoverFlag ? animateSpeed * delta : -animateSpeed * delta;
        progress = Math.min(progress, 17);
        progress = Math.max(progress, 0);
        angle += (progress > 5 ? rotateSpeed * delta : 0);
        requestAnimationFrame(draw);
    }

    // star particle settings value = min + random * range
    var mSize = 5,
        sizeRange = 10,
        mAlpha = .3,
        alphaRange = .7,
        mBlink = 2000,
        blinkRange = 1000,
        start = rad - 10,
        startRange = 10,
        mLife = 5000,
        lifeRange = 2000,
        mSpeed = 20 / (mLife + lifeRange / 2),
        speedRange = 10 / (mLife + lifeRange / 2),
        mAngle = Math.PI / 4,
        angleRange = Math.PI / 2,
        dirRange = Math.PI / 18,
        ridRange = Math.PI / 1500,
        lineWave = 3,
        expSpeed = 0.2;

    var EXPO = 'EXPO';
    var RAIN = 'RAIN';
    class starObj {
        constructor() {
            this.color = '';
            this.alpha = 0;
            this.size = 0;
            this.life = 0;
            this.age = 0;
            this.blink = 0;
            this.angle = 0;
            this.dirAngle = 0;
            this.start = 0;
            this.pos = 0;
            this.speed = 0;
            this.rotate = 0;
            this.rid = 0;
            this.flag = RAIN;

        }
        reset(posx, posy, angle) {
            if (posx) {
                this.reset2(posx, posy, angle);
            } else {
                this.reset1();
            }
        }

        draw(time, tempCv, mainCv, moving) {
            if (moving === undefined) {
                this.draw1(time, tempCv, mainCv);
            } else {
                this.draw2(time, tempCv, mainCv, moving);
            }
        }

        reset1() {
            var r1 = Math.random();
            this.size = mSize + r1 * sizeRange;
            this.size *= 0.7;
            this.color = Math.floor(Math.random() * colors.length);
            this.alpha = mAlpha + r1 * alphaRange;
            this.start = start + r1 * startRange;
            this.speed = mSpeed + r1 * speedRange;
            this.pos = 0;
            this.life = mLife + Math.random() * lifeRange;
            this.age = 0;
            this.blink = mBlink + Math.random() * blinkRange;
            this.life += this.blink - this.life % this.blink;
            this.angle = mAngle + Math.random() * angleRange;
            this.dirAngle = (1 - Math.random() * 2) * dirRange * Math.abs(1 - Math.PI / 2 / this.angle);
            this.rotate = Math.random() * 2 * Math.PI;
            this.rid = (1 - Math.random() * 2) * ridRange;
            this.flag = RAIN;
        }

        draw1(time, tempCv, mainCv) {
            this.pos += this.speed * time;
            this.age += time;
            this.rotate += this.rid * time;
            if (this.age > this.life) {
                return;
            };

            var a = Math.sqrt(0.5 - Math.abs((this.age % this.blink) / this.blink - 0.5)) * 2 * this.alpha;
            tempCv.clearRect(0, 0, tempLength, tempLength);
            tempCv.save();
            tempCv.fillStyle = getColor(this.color, a);
            tempCv.fillRect(0, 0, tempLength, tempLength);
            tempCv.globalCompositeOperation = 'destination-in';
            tempCv.drawImage(starImg, 0, 0, this.size, this.size);
            tempCv.restore();

            mainCv.save();
            mainCv.translate(w, h);
            mainCv.rotate(this.angle);
            mainCv.translate(this.start, 0);
            mainCv.rotate(Math.PI / 2 - this.angle);
            mainCv.translate(this.pos, 0);
            mainCv.rotate(this.rotate);
            mainCv.translate(-this.size / 2, -this.size / 2)
            mainCv.drawImage(ctemp, 0, 0);
            mainCv.restore();
        }

        reset2(posx, posy, angle) {
            this.pos = 0;
            this.start = [posx + (Math.random() - 0.5) * lineWave, posy + (Math.random() - 0.5) * lineWave];
            this.dirAngle = angle - Math.PI / 2 + (Math.random() - 0.5) * dirRange
            this.speed = mSpeed + Math.random() * speedRange;
            this.speed *= 3;
            this.size = mSize + Math.random() * sizeRange;
            this.color = Math.floor(Math.random() * colors.length);
            this.alpha = mAlpha + alphaRange;
            this.age = 0;
            this.blink = mBlink + Math.random() * blinkRange;
            this.life = 2.5 * this.blink;
            this.rotate = Math.random() * 2 * Math.PI;
            this.rid = (1 - Math.random() * 2) * ridRange;
            this.flag = EXPO;
        }
        draw2(time, tempCv, mainCv, moving) {
            if (moving || this.pos != 0) {
                var speedRange = (1 - expSpeed) * 2;
                this.pos += this.speed * time * (expSpeed + (1 - this.age / this.life) * speedRange);
                this.rotate += this.rid * time;
            }
            if (this.age > this.life) {
                return;
            };
            this.age += time;


            var a = Math.sqrt(Math.abs((this.age % this.blink) / this.blink - 0.5)) * 2 * this.alpha;
            tempCv.clearRect(0, 0, tempLength, tempLength);
            tempCv.save();
            tempCv.fillStyle = getColor(this.color, a);
            tempCv.fillRect(0, 0, tempLength, tempLength);
            tempCv.globalCompositeOperation = 'destination-in';
            tempCv.drawImage(starImg, 0, 0, this.size, this.size);
            tempCv.restore();

            mainCv.save();
            mainCv.translate(this.start[0], this.start[1]);
            mainCv.rotate(this.dirAngle);
            mainCv.translate(this.pos, 0);
            mainCv.rotate(this.rotate);
            mainCv.translate(-this.size / 2, -this.size / 2)
            mainCv.drawImage(ctemp, 0, 0);
            mainCv.restore();
        }

    }

    //star factory
    var exploding = [];
    var twinkling = [];

    function addStar(flag, x, y, angle) {
        var star;
        if (flag === RAIN) {
            if (twinkling.length < 20) {
                star = new starObj();
            } else {
                star = twinkling.shift();
            }
            star.reset();
            twinkling.push(star);
        } else {
            if (exploding.length < 120) {
                star = new starObj();
            } else {
                star = exploding.shift();
            }
            star.reset(x, y, angle);
            exploding.push(star);
        }
    }


    // tools
    function lerp(a, b, per) {
        return [((1 - per) * a[0] + per * b[0]), ((1 - per) * a[1] + per * b[1])]
    }

    function getColor(i, alpha) {
        return `rgba(${colors[i][0]},${colors[i][1]},${colors[i][2]},${alpha})`
    }

})();