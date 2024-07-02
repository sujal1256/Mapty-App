'use strict';

// prettier-ignore


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const delBtn = document.querySelector('.delBtn');
const copyright = document.querySelector('.copyright');
// const map = document.querySelector('#map');

// We can have our current location using getCurrentLocation function
// and the function takes 2 callback functions first for success and second for fail

class Workout{
  months = ["Jan","Feb","March","April","May","June","July","Aug","Sept","Oct","Nov","Dec"];
  distance;
  duration;
  id = (new Date().getMilliseconds()+'').slice(-10);
  date = new Date();
  constructor(coords,dist,dur,workoutName){
    this.description = `${workoutName} on ${this.months[this.date.getMonth()]} ${this.date.getDate()}`
    this.duration = dur;
    this.distance = dist; 
    this.coords = coords;
  }
}

class Running extends Workout{
  code;
  constructor(coords,dist,dur,cadence){
    super(coords,dist,dur,"Running");
    this.cadence = cadence;
    this.workoutName = "running";
    this.code = `<li class="workout workout--running" data-id="${this.id}">
      <button class="delBtn"><i class="fa-solid fa-trash"></i></button>

    <h2 class="workout__title">Running on ${this.months[this.date.getMonth()]} ${this.date.getDate()} ${(this.date.getHours()+'').padStart(2,'0')}:${(this.date.getMinutes()+'').padStart(2,'0')}:${(this.date.getSeconds()+'').padStart(2,'0')
    }</h2>
    <div class="workout__details">
      <span class="workout__icon">🏃‍♂️</span>
      <span class="workout__value">${this.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${this.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${(this.duration/this.distance).toFixed(2)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${this.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>`
  }

}

class Cycling extends Workout{
  code;
  constructor(coords,dist,dur,ele){
    super(coords,dist,dur,"Cycling");
    this.workoutName = "cycling";
    this.elevationGain = ele;
    this.code = `<li class="workout workout--cycling" data-id="${this.id}">
              <button class="delBtn"><i class="fa-solid fa-trash"></i></button>          
          <h2 class="workout__title">Cycling on  ${this.months[new Date().getMonth() -1]} ${new Date().getDate()}  ${(this.date.getHours()+'').padStart(2,'0')}:${(this.date.getMinutes()+'').padStart(2,'0')}:${(this.date.getSeconds()+'').padStart(2,'0')
    }</h2>
          <div class="workout__details">
            <span class="workout__icon">🚴‍♀️</span>
            <span class="workout__value">${this.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${this.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${(this.distance/this.duration).toFixed(2)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${this.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`
  }

}
class App{
    #map;
    #mapEvent;
    #mapZoomLevel = 15;
    workoutArray = [];
    constructor(){
      this.workoutArray = [];
      this._getPosition();
      this._getItemFromLocalStorage();
        
        inputType.addEventListener('change',this._toggleElevationField.bind(this))
        
        form.addEventListener('submit',this._newWorkout.bind(this));
        
        containerWorkouts.addEventListener('click',this._moveToPopup.bind(this));

    }

    _getPosition(){
        navigator.geolocation.getCurrentPosition(this._loadmap.bind(this),function(){
            // fail
            alert('Locaton not found');
        });

        
    }

    _loadmap(pos){        
        const longitude = pos.coords.longitude;
        const latitude = pos.coords.latitude;
        // remember that latitude comes first and then longitude
        
        this.#map = L.map('map').setView([latitude, longitude], this.#mapZoomLevel);
        
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
    
        this._showForm.call(this);

 
        JSON.parse(localStorage.getItem('workout'))?.forEach(e => {    
          const [lat,lng] = e.coords;

          L.marker([lat, lng]).addTo(this.#map)
          .bindPopup(L.popup({
              autoClose: false,
              closeOnClick: false,
              className: `${e.workoutName}-popup`
          }).setContent(`${e.description}`))
          .openPopup();
        });
    }

    _showForm(){
        this.#map.on('click',(e)=>{
            this.#mapEvent = e;
            form.classList.remove('hidden');
            inputDistance.focus();
        })
    }

    _toggleElevationField(){
        if(this.value === 'running'){
            inputElevation.closest('.form__row').classList.add('form__row--hidden');
            inputCadence.closest('.form__row').classList.remove('form__row--hidden');
        }
        else{
            inputCadence.closest('.form__row').classList.add('form__row--hidden');
            inputElevation.closest('.form__row').classList.remove('form__row--hidden');       
        }
    }

    _newWorkout(e){

        const validInputs =(...inputs) =>           
          inputs.every(e=>Number.isFinite(+e));
        const allPositive =(...inputs) => 
          inputs.every(e => +e>0);

        let mapEvent = this.#mapEvent;
        e.preventDefault();
        const input = inputType.value;
        const {lat,lng} = mapEvent.latlng;
        
        let work;
        if(inputType.value == 'running'){
           if(!validInputs(inputDistance.value,inputDuration.value,inputCadence.value) || 
           !allPositive(inputDistance.value,inputDuration.value,inputCadence.value)){
              alert('The inputs are not valid');
              this._formatForm();
              return;
           }

            work = new Running([lat,lng],inputDistance.value,inputDuration.value,inputCadence.value);

        }
        else{

          if(!validInputs(inputDistance.value,inputDuration.value,inputElevation.value) || 
          !allPositive(inputDistance.value,inputDuration.value)){
           alert('The inputs are not valid');
           this._formatForm();
           return;
          }
            work = new Cycling([lat,lng],inputDistance.value,inputDuration.value,inputElevation.value);
        }   

        form.insertAdjacentHTML('afterend',work.code);
        
        
        const marker = L.marker([lat, lng]).addTo(this.#map)
        .bindPopup(L.popup({
          autoClose: false,
          closeOnClick: false,
          className: `${inputType.value}-popup`
        }).setContent(`${work.description}`))
        .openPopup();
        this.workoutArray.unshift(work);

        this._formatForm();

        this._setItemInLocalStorage();
        
    }
    _formatForm(){
      form.classList.add('hidden');
      inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = ''; 
    }
    _moveToPopup(e){
      // console.log(e.target);
      
      if(e.target?.parentElement.classList.contains('delBtn') || e.target.classList.contains('delBtn') || e.target.parentElement.parentElement.classList.contains('delBtn')){
        this._deleteWorkout(e);
        return;
      } 
      
      const workoutEle = e.target.closest('.workout');
      if(!workoutEle) return;
      const ans = this.workoutArray.find(work => work.id === workoutEle?.dataset?.id);
      
      this.#map.setView(ans.coords,this.#mapZoomLevel,{
        animate: true,
        pan:{
          duration:0.8
        }
      });
    }
    _removeAllChilds(){
      while(containerWorkouts.firstChild){
        containerWorkouts.removeChild(containerWorkouts.firstChild);
      }
      containerWorkouts.append(form);
      containerWorkouts.append(copyright);

    }
    _renderWorkout(data){
      this._removeAllChilds();
      data?.forEach(e => {    
        
        const [lat,lng] = e.coords;
        // add workouts to list
        form.insertAdjacentHTML('afterend',e.code);
      });
    }
    _setItemInLocalStorage(){
      localStorage.setItem('workout',JSON.stringify(this.workoutArray));
    }
    _getItemFromLocalStorage(){
      const data = JSON.parse(localStorage.getItem('workout'));
      this.workoutArray = data?data:[];
      this._renderWorkout(data);
      
    }
    _deleteWorkout(e){
      const id = e.target.closest('.workout').getAttribute('data-id')
      const filteredWorkout = this.workoutArray.filter((e)=>e.id != id);
      const workoutToDelete = this.workoutArray.find(e=>e.id == id);
      
      this.#map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            const markerCoords = layer.getLatLng();
            if (markerCoords.lat === workoutToDelete.coords[0] && markerCoords.lng === workoutToDelete.coords[1]) {
                this.#map.removeLayer(layer);
            }
        }
    });
      this._renderWorkout(filteredWorkout);
      this.workoutArray = filteredWorkout;     
      this._setItemInLocalStorage();

      
     
    }
}


const app = new App();
