
class ABRLookupAPI {

    constructor() {
        this.url = "https://abr.business.gov.au/json";
        this.searchParams = new URLSearchParams({callback: "callback", guid: "b6242120-5bce-4b10-9839-d3045a7682da"});
        this.ABNweightingTable = [
            10,     1,      3,      
            5,      7,      9,      
            11,     13,     15,     
            17,     19
        ];
    }

    verifyABN(ABN) {
        try {
            const digitisedABN = ABN.split('');

            if (digitisedABN.length !== 11) {
                return 'INVALID_LENGTH';
            }

            digitisedABN.forEach((element, index) => {
                digitisedABN[index] = +element;
            });
            digitisedABN[0]--;

            let checkSum = 0;
            for (let i=0; i<11; i++) {
                checkSum += digitisedABN[i] * this.ABNweightingTable[i]
            }

            if (checkSum % 89 !== 0) {
                return "INVALID_CHECKSUM";
            }
            return true;
        } catch (error) {
            switch (error) {
                case TypeError:
                    return "INVALID_TYPE";
            }
            return error;
        }
    }

    verifyName(name) {
        try {
            if (!/^[ !"#$%&'()*,-./0-9:;=?@A-Z\\_a-z{}|]+$/.test(name)) {
                return false;
            }
            return true;
        } catch {
            return false;
        }
    }
    
    data2Json(data) {
        const stringJson = data.slice(9,-1);
        const json = JSON.parse(stringJson);
        return json;
    }

    async findByABN(ABN) {
        this.searchParams.append("abn", ABN);
        const queryString = this.searchParams.toString();
        this.searchParams.delete("abn");
        const dataurl = this.url + "/AbnDetails.aspx" + "?" + queryString;

        let response = await fetch(dataurl);
        response = await response.text();
        
        const data = this.data2Json(response);
        return data;
    }

    async findByName(name, maxResults=10) {
        this.searchParams.append("name", name);
        this.searchParams.append("maxResults", maxResults);
        const queryString = this.searchParams.toString();
        this.searchParams.delete("name");
        this.searchParams.delete("maxResults");
        const dataurl = this.url + "/MatchingNames.aspx" + "?" + queryString;

        let response = await fetch(dataurl);
        response = await response.text();

        const data = this.data2Json(response);
        return data["Names"];
    }

}

export default ABRLookupAPI;
