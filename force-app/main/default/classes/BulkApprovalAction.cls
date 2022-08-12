public class BulkApprovalAction {
    public static void processRecord(Account record,String comment,String userId){
        try{
            Approval.ProcessSubmitRequest request = new Approval.ProcessSubmitRequest();
            request.setComments(comment);
            request.setObjectId(record.id);
            request.setNextApproverIds(new Id[] {userId});
            Approval.process(request);
        }
        catch(Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static List<Account> getRecords(){
        try {
            return [Select Id,Name from Account];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static List<User> getUsers(){
        try {
            return [Select Id,Name from User];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static void sendRecordForApprovals(List<Account> records,String comment,String userId){
        System.debug(records.size());
        for(Integer i = 0 ; i < records.size() ; i++){
            processRecord(records[i],comment,userId);
        }
    }
}