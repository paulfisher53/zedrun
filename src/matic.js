import settings from './settings.json';

function rsv(e) {
    const t = e.substring(2), a = "0x" + t.substring(0, 64), n = "0x" + t.substring(64, 128), s = parseInt(t.substring(128, 130), 16); return { r: a, s: n, v: s < 2 ? 27 + s : s };
}

export async function send(address, contract, nonce, func) {

    let t = {
        "types": {
            "EIP712Domain": [
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "version",
                    "type": "string"
                },
                {
                    "name": "verifyingContract",
                    "type": "address"
                },
                {
                    "name": "salt",
                    "type": "bytes32"
                }
            ],
            "MetaTransaction": [
                {
                    "name": "nonce",
                    "type": "uint256"
                },
                {
                    "name": "from",
                    "type": "address"
                },
                {
                    "name": "functionSignature",
                    "type": "bytes"
                }
            ]
        },
        "domain": {
            "name": "ZED Racing",
            "version": "1",
            "verifyingContract": contract,
            "salt": "0x0000000000000000000000000000000000000000000000000000000000000089"
        },
        "primaryType": "MetaTransaction",
        "message": {
            "nonce": nonce,
            "from": address,
            "functionSignature": func
        }
    };

    const params = [address, JSON.stringify(t)];

    let txhash = await window.ethereum.request({
        method: "eth_signTypedData_v4",
        params: params,
        jsonrpc: "2.0",
        id: 999999999999,
        from: address
    });

    const { r: y, s: N, v: g } = rsv(txhash);
    const body = {
        to: contract,
        userAddress: address,
        apiId: settings.biconomy.appid,
        params: [address, func, y, N, g]
    };

    return await fetch(settings.biconomy.url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "x-api-key": settings.biconomy.apikey
        },
        body: JSON.stringify(body)
    });
}