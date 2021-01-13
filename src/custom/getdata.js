import { getOrigincell } from '../global/getdata';

export function getcellDisplayFormula(r, c, i, data) {
    let cell;
    if (data != null) {
        cell = data[r][c];
    } else {
        cell = getOrigincell(r, c, i);
    }


    if (cell == null) {
        return null;
    }

    return cell.df;
}