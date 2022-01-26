/*class Maillon {
	constructor (i) {
		this.el = null;
		this.num = i;
		this.pos = i;
		this.type = null;
	}
}

class MaillonInterne extends Maillon {
	constructor (i) {
		super (i);
		this.type = 'interne';
	}
	appendTo(_to) {
		this.el = _to.appendChild(document.createElementNS("http://www.w3.org/2000/svg", 'g'));
		this.el.setAttribute('class', 'm-plaque m-plaque-int');
		this.el.setAttribute('id', 'g-m-int-' + this.num);

		let _p = this.el.appendChild(document.createElementNS("http://www.w3.org/2000/svg", 'path'));
		_p.setAttribute('class', 'm-plaque m-plaque-int');
		_p.setAttribute('id', 'p-m-int-' + this.num);
		_p.setAttribute('d', 'm 0,0 c -3.952967,0 -6.080007,2.703195 -6.080007,6.079982 0,3.37681 2.703186,6.08003 6.080007,6.08003 3.376817,0 3.951791,-2.62131 10,-2.62131 6.181552,0 6.180386,2.62131 10,2.62131 3.952961,0 6.080008,-2.70319 6.080008,-6.08003 0,-3.376787 -2.703204,-6.079982 -6.080008,-6.079982 -3.376775,0 -3.951754,2.620958 -10,2.620958 -6.181569,0 -6.18038,-2.620958 -10,-2.620958 z');
			
		return this;
		// this._setPosition(_g, p);	
	}
}

class MaillonExterne extends Maillon {
	constructor (i) {
		super (i);
		this.type = 'externe';
	}	
	appendTo(_to) {
		this.el = _to.appendChild(document.createElementNS("http://www.w3.org/2000/svg", 'g'));
		this.el.setAttribute('class', 'm-plaque m-plaque-ext');
		this.el.setAttribute('id', 'g-m-ext-' + this.num);
		
		let _p = this.el.appendChild(document.createElementNS("http://www.w3.org/2000/svg", 'path'));
		_p.setAttribute('class', 'm-plaque m-plaque-ext');
		_p.setAttribute('id', 'p-m-ext-' + this.num);
		_p.setAttribute('d', 'm 0,0 c -3.952967,0 -6.080007,2.703195 -6.080007,6.079982 0,3.37681 2.703186,6.08003 6.080007,6.08003 3.376817,0 3.951791,-2.62131 10,-2.62131 6.181552,0 6.180386,2.62131 10,2.62131 3.952961,0 6.080008,-2.70319 6.080008,-6.08003 0,-3.376787 -2.703204,-6.079982 -6.080008,-6.079982 -3.376775,0 -3.951754,2.620958 -10,2.620958 -6.181569,0 -6.18038,-2.620958 -10,-2.620958 z');
		
		let _ca = this.el.appendChild(document.createElementNS("http://www.w3.org/2000/svg", 'circle'));
		_ca.setAttribute('class', 'm-pivot m-pivot-a');
		_ca.setAttribute('cx', '0');
		_ca.setAttribute('cy', '6');
		_ca.setAttribute('r', '2');

		let _cb = this.el.appendChild(document.createElementNS("http://www.w3.org/2000/svg", 'circle'));
		_cb.setAttribute('class', 'm-pivot m-pivot-b');
		_cb.setAttribute('cx', '20');
		_cb.setAttribute('cy', '6');
		_cb.setAttribute('r', '2');	
		
		return this;
		//this._setPosition(_g, p);		
	}	
}*/

/// sources : https://fr.wikipedia.org/wiki/Syst%C3%A8me_bielle-manivelle

class Cylindre {
	constructor () {
		this.group = undefined;
		this.piston = undefined;
		this.bielle = undefined;
		this.vilebrequin = undefined;

		this.longueurBielle = 180;

		this.toursParMinute = 30;
		this.tours = 0;
		
		/// etapes totales = pour les 4 temps = pour 2 tours de vilebrequin
		this.nombreEtapes = 40;
		
		/// rayon vilebrequin
		this._r = 40;
		this.temps = 0;
		
		/// event
		this._fnTempsChange = undefined;
	}
	
	
	attachTo(_to) {
		if (_to == undefined) throw ('impossible d\'attacher, cible undefined.');
		this.group = _to;

		this.piston = this.group.querySelector('.g-piston');
		this.bielle = this.group.querySelector('.g-bielle');
		this.vilebrequin = this.group.querySelector('.g-vilebrequin');
		
		
		this.dispTemps = this.group.querySelector('.dispTemps');
		
		if (this.piston == undefined)  throw('piston manquant !');
		if (this.bielle == undefined) throw('bielle manquante !');
		if (this.vilebrequin == undefined) throw('vilebrequin manquant !');

		this._init();
		
		return [];
	}
	
	addEventTempsChange (f)  {
		this._fnTempsChange = (typeof(f)==='function')?f:undefined;
	}
	
	_init_angle () {
		/// 720 car nombre etapes pour 2 tours de vilebrequin 
		/// this._angleEtape = 360/(this.nombreEtapes /2) <=> this._angleEtape = 720/this.nombreEtapes;
		this._angleEtape = 720/this.nombreEtapes;
		return this._angleEtape;
	}
	
	_init () {
		this._init_angle();
		this._etapeNum = 0;
		
		let _rappBM = this.longueurBielle / this._r;
		this._rappBM2 = _rappBM * _rappBM;
		this.temps = -1;
		this._updateTemps();
		
		this._intervalID = -1;
		this._delay = -1;
		
		return true;
	}	
	
	_initVitesse() {
		let _d = this._delay;
		this._delay = 50; // delay cible
		this.nombreEtapes = 2* Math.round(60000 / (this.toursParMinute * this._delay));
		if (this.nombreEtapes<8) this.nombreEtapes = 8; /// pas moins de 4 etapes sinon c est moche
		else {
			let _reste = this.nombreEtapes % 4;
			if (_reste !== 0) this.nombreEtapes += (4-_reste);
		}
		
		this._delay = 2*Math.round(60000 / (this.toursParMinute  * this.nombreEtapes ));
		
		this._init_angle();

		if (this._intervalID === -1 || _d != this._delay) {
			if (this._intervalID !== -1) clearInterval(this._intervalID);
			this._intervalID = setInterval(function (){cylindre.etapeSuivante()},this._delay)
		}

		return true;
	}
	
	demarrer () {
		this._initVitesse();
		
		return true;
		
	}
	
	vitesse(v) {
		this.toursParMinute = v;
		
		this._initVitesse();
		
		return true;		
	}
	
	ralentir() {
		if (this.toursParMinute <= 5) return false;
		this.toursParMinute -= 5;
		
		this._initVitesse();
		
		return true;
	}
	
	accelerer() {
		if (this.toursParMinute >= 600) return false;
		this.toursParMinute += 5;
		
		this._initVitesse();
		
		return true;
	}
	
	stop () {
		if (this._intervalID !== -1) clearInterval(this._intervalID);
		this._intervalID = -1;
		this._delay = -1;

		return true;
	}
	
	etapeSuivante () {
		this._etapeNum += 1;
				
		if (this._etapeNum >= this.nombreEtapes) {
			this._etapeNum = 0;
			this.tours += 1;
		}
		
		let _a = (this._etapeNum * this._angleEtape);
		
		let _arad = (_a + 90) * Math.PI / 180;
		
		let _cosa = Math.cos(_arad);
		let _cos2a = _cosa * _cosa;
		let _distPiston = this._r*(Math.sin(_arad) + Math.sqrt(this._rappBM2 - _cos2a))
	
		let _ecartAxe = this._r * _cosa;
		let _angleBielle = Math.asin(_ecartAxe / this.longueurBielle) * 180 / Math.PI;
		
		this.bielle.setAttribute('transform', 'translate(0, '+(this.longueurBielle + this._r-_distPiston)+') rotate('+(_angleBielle)+ ')');//)
		this.vilebrequin.setAttribute('transform', 'rotate(' + ((this.tours * 360) + _a)+ ')');
		this.piston.setAttribute('transform', 'translate(0, '+(this.longueurBielle + this._r-_distPiston)+')');	

		this._updateTemps();
		
		return true;
	}
	
	_updateTemps() {
		let _tp = this.temps;
		let _t = Math.floor(this._etapeNum / (this.nombreEtapes / 4));
		
		if (_t === _tp) return true;
		
		this.temps = _t;
		
		if (_tp != -1 && this.group.classList.contains('temps-'+_tp)) this.group.classList.remove('temps-'+_tp);
		this.group.classList.add('temps-'+this.temps);	

		if (this._fnTempsChange != undefined) this._fnTempsChange(this.temps, this);
		
		return true;		
	}

}
