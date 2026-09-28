const cds = require('@sap/cds');
const { data } = require('@sap/cds/lib/dbs/cds-deploy');
const { isdir, exists } = require('@sap/cds/lib/utils/cds-utils');

module.exports = cds.service.impl(async function () {
 
    const { EmployeeSrv, ProductsSrv, PurchaseItemSrv,AdressesSrv,BusinessPartnerSrv, PurchaseOrderSrv } = this.entities;
 
    // Implementation of an action
    // There are 3 generic handlers
    // .before() : Pre-check and validation
    // .on() : Performing DB operations
    // .after() : To save / close connections
 
    this.on("createEmployee", async (request, response) => {
 
        // Step - 2 : Get the data which is coming from the API
        const empData = request.data;
 
        // Step - 3 : Instantiate the transaction object
        const objTransaction = cds.tx(request);
 
        // Step - 4 : Insert the record into database
        let returnData = await objTransaction.run([
            INSERT.into(EmployeeSrv).entries(empData)
        ]).then((resolve, reject) => {
            if (typeof(resolve) !== undefined) {
                return request.data;
            } else {
                request.error(500, "Error in inserting data into the database");
            }
        }).catch(err => {
            request.error("There is an error : ", err.toString());
        })
 
        // Step - 5 : Return the data
        return returnData;
    })

    this.on('updateEmployee', async (request, response)=>{
        const{
            ID,
            salaryAmount,
            Currency_code
        }=request.data;

        try{
            const objTransaction=cds.tx(request);

            await objTransaction.update(EmployeeSrv).with({
                salaryAmount:salaryAmount,
                Currency_code:Currency_code,
            }).where({
                ID:ID
            })
            return "Successfully updated";
        }catch(error){
            request.error("Error:", error)
        }
    })


    this.on('updateProduct', async (request, response)=>{
        const{
            PRICE
        }=request.data;

        try{
            const objTransaction=cds.tx(request);

            await objTransaction.update(ProductSrv).with({
                PRICE:PRICE,
            }).where({
                ID:ID
            })
            return "Successfully updated";
        }catch(error){
            request.error("Error:", error)
        }
    })


     this.on("createProduct", async (request, response) => {
 
        // Step - 2 : Get the data which is coming from the API
        const proData = request.data;
 
        // Step - 3 : Instantiate the transaction object
        const objTransaction = cds.tx(request);
 
        // Step - 4 : Insert the record into database
        let returnData = await objTransaction.run([
            INSERT.into(ProductsSrv).entries(proData)
        ]).then((resolve, reject) => {
            if (typeof(resolve) !== undefined) {
                return request.data;
            } else {
                request.error(500, "Error in inserting data into the database");
            }
        }).catch(err => {
            request.error("There is an error : ", err.toString());
        })
 
        // Step - 5 : Return the data
        return returnData;
    })

    this.on("deleteEmployee", async (request, response) => {
        const{
            ID
        }=request.data;
        try{
            const objTransaction=cds.tx(request);

            await objTransaction.delete(EmployeeSrv).where({
                ID:ID
            })

            return "Successfully Deleted";
        }catch(error){
            request.error("Error:", error)
        }
    })


    this.before('UPDATE',EmployeeSrv,async(request,response)=>{
        const salaryAmt=request.data.salaryAmount;
        if(salaryAmt>100000){
            request.error("Get the Approval from your line Manager")
        }
    })

    this.before('UPDATE',ProductsSrv,async(request,response)=>{
        const Price=request.data.PRICE;
        if(Price>100000){
            request.error("Get the Approval from your line product Manager")
        }
    })

    this.before(['CREATE', 'UPDATE'], PurchaseItemSrv, async (request) => {
    const PRICE=request.data.PRICE;
    const CURRENCT_CODE=data.request.CURRENCT_CODE;

    // USD validation
    if (CURRENCT_CODE === 'USD' && PRICE > 15000) {
        return request.reject(
            400,
            'Gross amount exceeds 15000 USD. Please get in touch with your line manager.'
        );
    }

    // EUR validation
    if (CURRENCT_CODE === 'EUR' && PRICE > 10000) {
        return request.reject(
            400,
            'Gross amount exceeds 10000 EUR. Please check with your regional head.'
        );
    }
});

//2
this.before('UPDATE', AdressesSrv, async (request) => {

    const country = request.data.COUNTRY;

    if (country && !['GB', 'US'].includes(country)) {
        return request.reject(
            400,
            'Please contact your admin'
        );
    }

});

this.before('UPDATE', EmployeeSrv, async (request) => {

    const mobile = request.data.phoneNumber;

    if (mobile && !(mobile.startsWith('+1') || mobile.startsWith('+44'))) {
        request.error(400, 'Cannot update mobile number');
    }

});

this.before('UPDATE', BusinessPartnerSrv, async (request) => {

    const companyName = request.data.COMPANY_NAME;

    if (companyName && /[,\.\-]/.test(companyName)) {
        request.error(400, 'Invalid company name');
    }

});

this.before(['CREATE', 'UPDATE'], PurchaseItemSrv, async (request) => {

    const itemPos = request.data.PO_ITEMS_POS;

    if (itemPos !== undefined && itemPos % 10 !== 0) {
        request.error(
            400,
            'Item position should be a multiple of 10'
        );
    }

});

this.on('getHighestSalariedEmployees', async (request, response) => {
    try{
        //step -1 create an object for the transaction
        const transaction = cds.tx(request);
 
        //step-2 : Get salaries of an employee using Transaction object
        const response = await transaction.read(EmployeeSrv).orderBy({
            salaryAmount : 'desc'
 
        }).limit(10);
 
        //step-3 : Display the employee salaries
        return response ;
 
    }
    catch (error) {
        request.error("Error :", error)
    }
})

this.on('getHighestPricedProducts', async (request, response) => {
    try{
        //step -1 create an object for the transaction
        const transaction = cds.tx(request);
 
        //step-2 : Get salaries of an employee using Transaction object
        const response = await transaction.read(ProductsSrv).orderBy({
            PRICE : 'desc'
 
        }).limit(1);
 
        //step-3 : Display the employee salaries
        return response ;
 
    }
    catch (error) {
        request.error("Error :", error)
    }
})

this.on('discountPrice', async(request, response) => {
    try {

        // Step-1 : Get the parameter form the entity
        const ID = request.params[0];

        // Step-2 : creating object for transaction service using request
        const transaction = cds.tx(request);

        // Step-3 : update the purchase order service
        await transaction.update(PurchaseOrderSrv).with({
            GROSS_AMOUNT : {
                '-=' : 1000
            },
            NET_AMOUNT : {
                '-=' : 800
            },
            TAX_AMOUNT : {
                '-=' : 200
            }
        }).where(ID);

        const updatePOInfo = await transaction.read(PurchaseOrderSrv);

        return updatePOInfo;

    } catch (error) {
        return "Error : " + error.toString();
    }
})
this.on('largestOrder', async(request, response) => {
    try {

        // Step-2 : Creating object for transaction service using request
        const transaction = cds.tx(request);

        const reply = await transaction.read(PurchaseOrderSrv).orderBy({
            GROSS_AMOUNT : 'desc'
        }).limit(5);

        return reply;

    } catch (error) {
        return "Error : " + error.toString();
    }
})


this.on('top20', async (request, response) => {
    try{
        //step -1 create an object for the transaction
        const transaction = cds.tx(request);
 
        //step-2 : Get salaries of an employee using Transaction object
        const result = await transaction.read(ProductsSrv).orderBy({
            PRICE : 'desc'
 
        }).limit(20);
 
        //step-3 : Display the employee salaries
        return result;
 
    }
    catch (error) {
        request.error("Error :", error)
    }
})



this.on('top20Employees', async (request, response) => {
    try{
        //step -1 create an object for the transaction
        const transaction = cds.tx(request);
 
        //step-2 : Get salaries of an employee using Transaction object
        const result = await transaction.read(EmployeeSrv).orderBy({
            salaryAmount : 'desc'
 
        }).limit(20);
 
        //step-3 : Display the employee salaries
        return result;
 
    }
    catch (error) {
        request.error("Error :", error)
    }
})

this.on('IncreaseSal', async (req) => {

    const { ID } = req.params[0];
    const tx = cds.tx(req);

    const employee = await tx.read(EmployeeSrv).where({ ID });

    const newSalary = employee[0].salaryAmount * 1.10;

    await tx.update(EmployeeSrv)
        .with({ salaryAmount: newSalary })
        .where({ ID });

    return await tx.read(EmployeeSrv).where({ ID });
});



const {uuid, read, mkdirp}=cds.utils;

//Utilities
this.on('getUtilities',async(request,response)=>{
    let vUUID=uuid(), vPackageContent=null, vInput="%E%A%",uri, dirExists=false, isFileExists=false;

     vPackageContent=await read('package.json');

     if(exists('srv/request.http')){
        isFileExists=true;
     }

     try{
        uri=decodeURI(vInput);

        await mkdirp(srv/lib)
     }catch{
        uri=vInput
     }

     if(isdir('app')){
        dirExists=true;
     }

    var finalValue={
        uuid:vUUID,
        Packageinfo:vPackageContent,
        uri:uri,
        dirExists:dirExists,
        isFileExists:isFileExists
    }

    return finalValue;
})
 
})
 