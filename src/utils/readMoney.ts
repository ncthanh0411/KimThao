const DOC_SO = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
const DOC_HANG = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

function docBaSo(tram: number, chuc: number, donVi: number, docDayDu: boolean): string {
    let ketQua = "";
    if (tram === 0 && chuc === 0 && donVi === 0) return "";
    
    if (docDayDu || tram > 0) {
        ketQua += DOC_SO[tram] + " trăm";
    }

    if (chuc === 0 && donVi !== 0) {
        if (ketQua.length > 0) ketQua += " linh";
        ketQua += " " + DOC_SO[donVi];
    } else if (chuc === 1) {
        ketQua += " mười";
        if (donVi === 1) ketQua += " một";
        else if (donVi === 5) ketQua += " lăm";
        else if (donVi !== 0) ketQua += " " + DOC_SO[donVi];
    } else if (chuc > 1) {
        ketQua += " " + DOC_SO[chuc] + " mươi";
        if (donVi === 1) ketQua += " mốt";
        else if (donVi === 5) ketQua += " lăm";
        else if (donVi !== 0) ketQua += " " + DOC_SO[donVi];
    }

    return ketQua;
}

export const readMoney = (number: number): string => {
    if (number === 0) return "Không đồng";
    
    let str = Math.abs(number).toString();
    let i = 0;
    let arr = [];
    let index = str.length;
    let result = [];
    
    if (index === 0 || str === "NaN") return "";
    
    while (index >= 0) {
        arr.push(str.substring(Math.max(0, index - 3), index));
        index -= 3;
    }
    
    for (i = arr.length - 1; i >= 0; i--) {
        if (arr[i] !== "" && arr[i] !== "000") {
            const num = parseInt(arr[i], 10);
            const tram = Math.floor(num / 100);
            const chuc = Math.floor((num % 100) / 10);
            const donVi = num % 10;
            
            let doc = docBaSo(tram, chuc, donVi, i !== arr.length - 1);
            if (doc.trim() !== "") {
                result.push(doc.trim() + " " + DOC_HANG[Math.max(0, i - 1)]);
            }
        }
    }
    
    let stringResult = result.join(" ").trim();
    stringResult = stringResult.charAt(0).toUpperCase() + stringResult.slice(1);
    
    return stringResult + " đồng";
};