var nums = ['1','2','3','4','5','6','7','8','9'];
function Square(val, update, x, y){
    this.val = val;
    this.update = function(v){
        this.val = v;
        update(v);
    };
    this.position = [x, y];
}

function makenine(arr, xoff, yoff){
    nine = [];
    for(xf=0;xf<3;xf++){
        x = xf + xoff;
        for(yf=0;yf<3;yf++){
            y = yf + yoff;
            nine.push(arr[x][y]);
            arr[x][y].nine = nine;
        }
    }
    return nine;
}

function makenines(arr){
    nines = [];
    for(xoff=0;xoff<3;xoff++)
        for(yoff=0;yoff<3;yoff++)
            nines.push(makenine(arr, xoff*3, yoff*3));

    return nines;
}

function makepossibles(arr){
    for(x=0;x<9;x++){
        for(y=0;y<9;y++){
            elem = arr[x][y];
            if(elem.val!=""){ elem.possibles = []; continue; }
            possibles = ['1','2','3','4','5','6','7','8','9'];
            for(i in possibles){
                // eliminate possibles from row
                pfound = false;
                for(x1=0;x1<9;x1++){
                    if(x1==x || arr[x1][y].val=="") continue;
                    if(possibles[i]==arr[x1][y].val){
                        pfound = true;
                        possibles[i] = null;
                        break;
                    }
                }
                if(pfound) continue;
                // eliminate possibles from col
                for(y1=0;y1<9;y1++){
                    if(y1==y || arr[x][y1].val=="") continue;
                    if(possibles[i]==arr[x][y1].val){
                        pfound = true;
                        possibles[i] = null;
                        break;
                    }
                }
                if(pfound) continue;
                // eliminate possibles from nine
                for(j in elem.nine){
                    elem2 = elem.nine[j];
                    if(elem2.val=="" || elem2.position[0]==x || elem2.position[1]==y) continue; 
                    if(possibles[i]==elem2.val){
                        pfound = true;
                        possibles[i] = null;
                        break;
                    }
                }
            }
            pos = [];
            for(i in possibles)
                if(possibles[i]!=null) pos.push(possibles[i]);
            elem.possibles = pos;
            //console.log(elem.position[0]+" "+elem.position[1]+" "+elem.possibles);
        }
    }
}

function findval(arr, elem){
    var i, j, k, x, y;
    // return values: -1 = error, 0 = not found, <others> = value the element should take

    // we consider this an error because we shouldn't traverse this element
    if(elem.val!="") return -1;
    if(elem.possibles.length==0) return -1;
    if(elem.possibles.length==1){
        return elem.possibles[0];
    }
    // see if any possible value is unique in nine-square grid, row or col
    for(i in elem.possibles){
        cunique = nunique = runique = true;
        x = elem.position[0], y = elem.position[1];
        p = elem.possibles[i];
        nine = elem.nine;

        for(j=0;j<9;j++){
            relement = arr[j][y], celement = arr[x][j], nelement = nine[j];

            //row
            if(j!=x && relement.val=="" && runique){
                for(k in relement.possibles){
                    if(p==relement.possibles[k]){
                        runique = false;
                        break;
                    }
                }
            }
            //col
            if(j!=y && celement.val=="" && cunique){
                for(k in celement.possibles){
                    if(p==celement.possibles[k]){
                        cunique = false;
                        break;
                    }
                }
            }
            //nine
            if(nelement.val=="" && !(nelement.position[0]==x && nelement.position[1]==y) && nunique){
                for(k in nelement.possibles){
                    if(p==nelement.possibles[k]){
                        nunique = false;
                        break;
                    }
                }
            }
        }
        if(runique||cunique||nunique){
            return p;
        }
    }
    return 0;
}

function setval(arr, elem, val){
    var x = elem.position[0]; var y = elem.position[1];
    var i, j;
    elem.update(val);
    elem.possibles = [];

    //del from row
    for(i=0;i<9;i++){
        relem = arr[i][y], celem = arr[x][i], nelem = elem.nine[i];
        if(i!=x && relem.val==""){
            for(j in relem.possibles){
                if(relem.possibles[j]==val){
                    relem.possibles.splice(j,1);
                    break;
                }
            }
        }
        if(i!=y && celem.val==""){
            for(j in celem.possibles){
                if(celem.possibles[j]==val){
                    celem.possibles.splice(j,1);
                    break;
                }
            }
        }
        if(nelem.position[0]!=x && nelem.position[1]!=y && nelem.val==""){
            for(j in nelem.possibles){
                if(nelem.possibles[j]==val){
                    nelem.possibles.splice(j,1);
                    break;
                }
            }
        }
    }
}

function eliminate(arr){
    var i,j,k;
    var changes = [];
    for(i=0;i<9;i++){
        for(j=0;j<9;j++){
            elem = arr[i][j];
            if(elem.val!="") continue;
            val = findval(arr, elem);
            if(val>0){
                setval(arr, elem, val);
                changes.push(elem);
            }
            else if(val<0){
                return [true, changes];
            }
        }
    }
    return [false, changes];
}

function is_solved(arr){
    var i, j;
    for(i=0;i<9;i++)
        for(j=0;j<9;j++)
            if(arr[i][j].val=="") return false;
    return true;
}

function reversechanges(arr, changes){
    var i;
    for(i in changes){
        changes[i].update("");
    }
    makepossibles(arr);
}

function backtracker(arr, timelimit){
    var d = new Date();
    if(d.getTime()>=timelimit)
        return [false,[]];
    var i, j, k, val, changes=[], eli, bt;
    var elem = null, min=10;
    // find a square with least possibilities
    for(i=0;i<9;i++){
        for(j=0;j<9;j++){
            if(arr[i][j].val!="") continue;
            if(arr[i][j].possibles.length<min){
                elem = arr[i][j];
                min = elem.possibles.length;
            }
        }
    }

    var localpossibles = elem.possibles.slice();

    while(localpossibles.length>0){
        val = localpossibles.pop();
        setval(arr, elem, val);
        eli = eliminate(arr);
        changes = [elem].concat(eli[1]);
        //error, reverse all changes
        if(eli[0]){
            reversechanges(arr, changes);
            continue;
        }
        if(is_solved(arr))
            return [true, changes];
        bt = backtracker(arr, timelimit);
        changes = changes.concat(bt[1]);
        if(bt[0])
            return [bt[0], changes];
        reversechanges(arr, changes);
    }
    return [false, [elem]];
}

function solve(arr){
    var change = true, bt, res, changes;
    var nines = makenines(arr);
    var d = new Date();
    var timelimit = d.getTime()+1000;
    makepossibles(arr);
    //run till steady state or till time limit is reached
    while(change && d.getTime()<timelimit){
        change = false;
        res = eliminate(arr);
        changes = res[1];
        if(changes.length>0) change = true;
        if(change) continue;
        bt = backtracker(arr, timelimit);
        if(!bt[0]){
            change = true;
            makepossibles(arr);
        }
        d = new Date();
    }
    if(!is_solved(arr)){
        alert("Puzzle appears to be unsolvable.");
    }
}
