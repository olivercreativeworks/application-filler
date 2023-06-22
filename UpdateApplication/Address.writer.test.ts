import { AddressWriter, AddressFields } from "./Address.writer"
import { DynamicGrid } from "./DynamicGrid"

describe ("Address Writer", () => {
    const baseAddressData:AddressFields = {
        address: "a",
        borough: "b",
        councilDistrict: "c",
        development: "d",
        formattedAddress: "f",
        isNychaResident: "i"
    }
    
    const transformedAddressData:AddressFields = {
        address: "1",
        borough: "2",
        councilDistrict: "3",
        development: "4",
        formattedAddress: "5",
        isNychaResident: "6"
    }
    
    test("Should return input without changes / All information is already filled in", () => {
        const addressData_AllInfoProvided = DynamicGrid.fromObject({...baseAddressData})
        expect(AddressWriter.updateAddressFields(addressData_AllInfoProvided, () => transformedAddressData)).toEqual({...addressData_AllInfoProvided})
    })
    test("Should return the input without changes / Address is missing", () => {
        const addressData_MissingAddress = DynamicGrid.fromObject({...baseAddressData, address:""})
        expect(AddressWriter.updateAddressFields(addressData_MissingAddress, () => transformedAddressData)).toEqual({...addressData_MissingAddress})
    })
    test("Should return transformed output if at least one field is missing data / Missing borough", () => {
        const addressData_MissingNonAddressData = DynamicGrid.fromObject({...baseAddressData, borough:""})
        expect(AddressWriter.updateAddressFields(addressData_MissingNonAddressData, () => transformedAddressData).values).toEqual(DynamicGrid.fromObject({...transformedAddressData, address:baseAddressData.address}).values)
    })
    test("Should return input without changes / Only missing formatted address", () => {
        const addressData_MissingFormattedAddress = DynamicGrid.fromObject({...baseAddressData, formattedAddress:""})
        expect(AddressWriter.updateAddressFields(addressData_MissingFormattedAddress, () => transformedAddressData)).toEqual({...addressData_MissingFormattedAddress})
    })
})