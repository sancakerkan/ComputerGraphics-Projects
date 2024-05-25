// TO DO 1: Provides a 3x3 transformation matrix represented as an array containing 9 values arranged in column-major sequence.
// Initially, the transformation employs scaling, followed by rotation, and ultimately, translation.
// The specified rotation measurement is in degrees.

function GetTransform(positionX, positionY, rotation, scale) {
    
    const transformMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];

    transformMatrix[0] = scale;
    transformMatrix[4] = scale;

    const radianRotation = (rotation * Math.PI) / 180;
    const cos = Math.cos(radianRotation);
    const sin = Math.sin(radianRotation);

    const rotationMatrix = [cos, -sin, 0, sin, cos, 0, 0, 0, 1];
    transformMatrix[2] = positionX;
    transformMatrix[5] = positionY;

    const resultMatrix = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let sum = 0;
            for (let k = 0; k < 3; k++) {
                sum += transformMatrix[i * 3 + k] * rotationMatrix[k * 3 + j];
            }
            resultMatrix.push(sum);
        }
    }

    return resultMatrix;
}




// TO DO 2:Provides a 3x3 transformation matrix represented as an array containing 9 values arranged in column-major sequence.
// The inputs consist of transformation matrices following the identical format.
// The resulting transformation initially employs trans1 and subsequently applies trans2.

function ApplyTransform(trans1, trans2) {
    
    const resultMatrix = [];

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let sum = 0;
            for (let k = 0; k < 3; k++) {
                sum += trans1[i * 3 + k] * trans2[k * 3 + j];
            }
            resultMatrix.push(sum);
        }
    }

    return resultMatrix;
}

const droneImage = document.getElementById('drone');
const shadowImage = document.getElementById('shadow');


const droneTransform = GetTransform(dronePositionX, dronePositionY, droneRotation, droneScale);
const shadowTransform = GetTransform(shadowPositionX, shadowPositionY, shadowRotation, shadowScale);


droneImage.style.transform = `matrix(${droneTransform.join(',')})`;
shadowImage.style.transform = `matrix(${shadowTransform.join(',')})`;
