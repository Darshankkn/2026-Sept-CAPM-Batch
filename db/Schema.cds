namespace products.db;

using{cuid, Currency} from '@sap/cds/common';
using{products.common as c} from './common';

context master{
    entity BusinessPartners{
        key NODE_KEY:c.Guid;
        BP_ROLE:c.Role;
        EMAIL:c.Email;
        MOBILE:c.PhoneNumber;
        FAX:c.String32;
        WEB: c.String255;
        BP_ID:c.Guid;
        COMPANY_NAME:c.String255;
        //MANAGED ASSOCIATION
        AD:Association to Adresses;
    }

    entity Adresses: c.Address{
        key NODE_KEY:c.Guid;
        ADDRESS_TYPE:c.String32;
        VAL_START:Date;
        VAL_END:Date;
        LATITUDE:Decimal;
        LONGITUDE:Decimal;
        //UNMANGED ASSOCIATION
        BP:Association to one BusinessPartners on BP.AD=$self;
    }

    entity Products{
        key NODE_KEY:c.Guid;
        PRODUCT_ID:c.String32;
        TYPE_CODE:String(2);
        CATEGORY:c.String32;
        DESCRIPTION:c.String255;
        TAX_TARRIF_CODE:Integer;
        MEASURE_UNIT:String(2);
        WEIGHT_MEASURE:Decimal(5,2);
        WEIGHT_UNIT:String(2);
        PRICE:Decimal(15,2);
        CURRENCT_CODE:String(5);
        WIDTH:Decimal(5,2);
        DEPTH:Decimal(5,2);
        HEIGHT:Decimal(5,2);
        DIM_UNIT:String(2);
        //MANAGED ASSOCIATION
        SUPPLIERS: Association to BusinessPartners
    }

    entity Employees:cuid{
        nameFirst:c.String64;
        nameLast:c.String64;
        nameIntials:c.String64;
        nameMiddle:c.String64;
        gender:c.Gender;
        language:String(2);
        loginName:String(16);
        phoneNumber:c.PhoneNumber;
        email:c.Email;
        Currency:Currency;
        salaryAmount:c.AmountT;
        accountNumber:c.String32;
        bankId:String(16);
        bankName:c.String64


    }

}

context transaction{
    entity PurchaseOrders: c.Amount {
        key NODE_KEY: c.Guid;
        PO_ID:c.Guid;
        //Managed Association
        PARTNER: Association to master.BusinessPartners;
        LIFECYCLE_STATUS: String(1);
        OVERALL_STATUS:String(1);
        //Unmanaged Association
        Items: Association to many PurchaseItems on Items.PARENT= $self;
 
    }
    entity PurchaseItems: c.Amount {
        key NODE_KEY: c.Guid;
        //Parent Key
        PARENT:Association to PurchaseOrders;
        PO_ITEMS_POS: Integer;
        //Managed Association
        PRODUCT: Association to master.Products;
    }
}