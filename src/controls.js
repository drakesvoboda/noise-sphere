import {
    Euler,
    EventDispatcher,
    Vector3
} from 'three';

const _euler = new Euler(0, 0, 0, 'YXZ');
const _vector = new Vector3();
const _changeEvent = { type: 'change' };
const _PI_2 = Math.PI / 2;

class CameraControls extends EventDispatcher {
    constructor(camera, domElement) {
        super();

        if (domElement === undefined) {
            console.warn('The second parameter "domElement" is mandatory.');
            domElement = document.body;
        }

        this.domElement = domElement;
        this.isLocked = false;

        this.minPolarAngle = 0;
        this.maxPolarAngle = Math.PI;

        const scope = this;

        var previousTouch;

        function onMouseMove(event) {
            if (scope.isLocked === false && event.type != 'touchmove') return;

            if (event.type == 'touchmove') {
                event.preventDefault();

                const touch = event.touches[0];

                if (previousTouch) {
                    // be aware that these only store the movement of the first touch in the touches array
                    event.movementX = touch.pageX - previousTouch.pageX;
                    event.movementY = touch.pageY - previousTouch.pageY;
                };

                previousTouch = touch;
            }

            const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

            _euler.setFromQuaternion(camera.quaternion);

            _euler.y -= movementX * 0.004;
            _euler.x -= movementY * 0.004;

            _euler.x = Math.max(_PI_2 - scope.maxPolarAngle, Math.min(_PI_2 - scope.minPolarAngle, _euler.x));

            camera.quaternion.setFromEuler(_euler);

            scope.dispatchEvent(_changeEvent);
        }

        scope.domElement.ownerDocument.addEventListener('mouseup', (e) => scope.isLocked = false);
        scope.domElement.addEventListener('mousedown', (e) => scope.isLocked = true);
        scope.domElement.ownerDocument.addEventListener('mousemove', onMouseMove);

        scope.domElement.ownerDocument.addEventListener('touchend', (e) => {
            previousTouch = null;
        });

        scope.domElement.addEventListener('touchmove', onMouseMove);
    }
}

export { CameraControls };