
alter table email_metrics
add column failed_count integer default 0,
add column bounced_count integer default 0,
add column clicked_count integer default 0,
add column received_count integer default 0;
