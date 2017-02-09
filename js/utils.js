/**
 * Created by scottwainman on 9/29/16.
 */

class Utils
{
    constructor()
    {
        //Static Class, never make one!
    }

    static getMouse(e,screen){
    var offsetLeft = screen.offsetLeft,
        offsetTop = screen.offsetTop,
        x, y;
    x = e.pageX;
    y = e.pageY;
    x -= offsetLeft;
    y -= offsetTop;
   // console.log(offsetLeft)
    return {x:x,y:y};
    }

    static getAverage(arr)
    {
        /*
        * loop through array
        * add numbers to get total
        * divide total by sum of numbers
        * */
        var total = 0;
        arr.forEach((element)=>{
            total += element;
        });

        return total / arr.length;

    }
}
